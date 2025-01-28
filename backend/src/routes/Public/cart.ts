import express, { Router } from 'express';
import prisma from '../../lib/prisma';

const router: Router = express.Router();

router.post('/api/cart/add', async (req, res): Promise<void> => {
  const { userId, productId, quantity } = req.body;

  try {
    // 1. Validate input
    if (!userId || !productId || !quantity || quantity <= 0) {
        res.status(400).json({ message: 'Invalid input data.' });
        return
    }

    // 2. Check if the product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
        res.status(404).json({ message: 'Product not found.' });
        return
    }

    if (product.stock < quantity) {
       res.status(400).json({ 
        message: `Not enough stock available. Current stock: ${product.stock}` 
      });
      return
    }

    // 3. Ensure the user has a cart (create one if it doesn't exist)
    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // 4. Add or update the product in the cart
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
      create: {
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
      },
      update: {
        quantity: {
          increment: quantity, // Increment the quantity if the item already exists
        },
      },
    });

    // 5. Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

     res.status(200).json({
      message: 'Product added to cart successfully.',
      cartItem,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
});


export default router;