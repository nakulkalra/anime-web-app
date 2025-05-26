import express, { Request, Response, Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate } from '../../auth';
import { createPaymentIntent, stripe } from '../../lib/stripe';
import Stripe from 'stripe';
import config from '../../Config';
import { Cart, CartItem, Product, Prisma } from '@prisma/client';

type CartWithItems = Cart & {
    items: (CartItem & {
        product: Product & {
            sizes: {
                id: number;
                productId: number;
                size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
                quantity: number;
                createdAt: Date;
                updatedAt: Date;
            }[];
        };
    })[];
};

const router: Router = express.Router();

router.post('/api/order/place-order', authenticate, async (req: Request, res: Response) => {
    const userId = req.headers["x-user-id"] as string;

    const porvidedUserId = req.body.userId;
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
                        product: {
                            include: {
                                sizes: true
                            }
                        }
                    }
                }
            }
        }) as CartWithItems | null;

        if (!cart) {
            res.status(404).json({ message: 'Cart not found.' });
            return;
        }

        if (cart.items.length === 0) {
            res.status(400).json({ message: 'Cart is empty.' });
            return;
        }

        // Check if all items are in stock for their respective sizes
        for (const item of cart.items) {
            const productSize = item.product.sizes.find(ps => ps.size === item.size);
            if (!productSize) {
                res.status(400).json({ 
                    message: `Size ${item.size} not available for ${item.product.name}` 
                });
                return;
            }
            if (productSize.quantity < item.quantity) {
                res.status(400).json({ 
                    message: `Insufficient stock for ${item.product.name} in size ${item.size}. Available: ${productSize.quantity}, Requested: ${item.quantity}` 
                });
                return;
            }
        }

        // Calculate total price
        const totalPrice = cart.items.reduce((acc: number, item) => 
            acc + (item.product.price * item.quantity), 0);

        // Create Stripe payment intent
        // const { clientSecret, paymentIntentId } = await createPaymentIntent(totalPrice);
        const clientSecret = "test";
        const paymentIntentId = "test";

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
                            size: item.size,
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

            // Decrement product quantities for each size
            for (const item of cart.items) {
                await tx.productSize.update({
                    where: {
                        productId_size: {
                            productId: item.productId,
                            size: item.size
                        }
                    },
                    data: {
                        quantity: {
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