import express, { Request, Response, Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate } from '../../auth';
import { createPaymentIntent, stripe } from '../../lib/stripe';
import Stripe from 'stripe';
import config from '../../Config';

const router: Router = express.Router();

router.post('/api/order/place-order', authenticate, async (req: Request, res: Response) => {
    const userId = req.headers["x-user-id"] as string;

    const porvidedUserId = req.body.userId;
    console.log(porvidedUserId);
    console.log(userId);
    if (!porvidedUserId) {
        res.status(400).json({ message: 'User ID is required.' });
        return;
    }

    if(porvidedUserId.toString() !== userId) {
        res.status(400).json({ message: 'User ID does not match.' });
        return;
    }
    
    try {
        //get the cart id from the user id
        const cartId = await prisma.cart.findUnique({
            where: { userId: parseInt(userId) },
            select: { id: true }
        });

        if (!cartId) {
            res.status(404).json({ message: 'Cart not found.' });
            return;
        }
        
        // Get cart with items and product details
        const cart = await prisma.cart.findUnique({
            where: { id: cartId.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart) {
            res.status(404).json({ message: 'Cart not found.' });
            return;
        }

        if (cart.items.length === 0) {
            res.status(400).json({ message: 'Cart is empty.' });
            return;
        }

        // Check if all items are in stock
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                res.status(400).json({ 
                    message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}` 
                });
                return;
            }
        }

        // Calculate total price
        const totalPrice = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

        // Create Stripe payment intent
        const { clientSecret, paymentIntentId } = await createPaymentIntent(totalPrice);

        // Use a transaction to ensure all operations succeed or fail together
        const order = await prisma.$transaction(async (tx) => {
            // Create order with items
            const newOrder = await tx.order.create({
                data: {
                    userId: parseInt(userId),
                    total: totalPrice,
                    items: {
                        create: cart.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity
                        }))
                    },
                    payment: {
                        create: {
                            amount: totalPrice,
                            status: 'PENDING',
                            stripePaymentIntentId: paymentIntentId
                        }
                    }
                },
                include: {
                    items: true,
                    payment: true
                }
            });

            // Decrement product quantities
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            // Clear the cart
            await tx.cartItem.deleteMany({
                where: { cartId: cartId.id }
            });

            return newOrder;
        });

        res.status(201).json({
            message: 'Order placed successfully',
            order: order,
            clientSecret: clientSecret
        });

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

// Webhook endpoint to handle Stripe events
router.post('/api/order/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
        res.status(400).json({ message: 'No signature found' });
        return;
    }

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            config.stripe.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            
            // Update order payment status
            await prisma.payment.update({
                where: {
                    stripePaymentIntentId: paymentIntent.id
                },
                data: {
                    status: 'PAID'
                }
            });

            // Update order status
            await prisma.order.update({
                where: {
                    id: parseInt(paymentIntent.metadata.orderId),
                    payment: {
                        stripePaymentIntentId: paymentIntent.id
                    }
                },
                data: {
                    status: 'PROCESSING'
                }
            });
        }

        res.status(200).json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(400).json({ message: 'Webhook error' });
    }
});

export default router;