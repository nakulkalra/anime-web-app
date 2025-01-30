import express, { Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate } from '../../auth';

const router: Router = express.Router();

router.get('/api/cart',authenticate, async (req, res): Promise<void> => {
  const userId = req.headers["x-user-id"] as string;

  
    try {
      // 1. Validate input
      if (!userId) {
        res.status(400).json({ message: 'User ID is required.' });
        return;
      }
  
      // 2. Retrieve the user's cart with product details
      const cart = await prisma.cart.findUnique({
        where: { userId: parseInt(userId) },
        include: {
          items: {
            include: {
              product: true, // Include product details (name, price, etc.)
            },
          },
        },
      });
  
      // 3. Handle case where the cart doesn't exist or is empty
      if (!cart || cart.items.length === 0) {
        res.status(404).json({ message: 'Cart is empty or does not exist.' });
        return;
      }
  
      // 4. Format the response
      const cartDetails = cart.items.map((item) => ({
        cartItemId: item.id,
        productId: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        quantity: item.quantity,
        totalPrice: item.quantity * item.product.price,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
  
      res.status(200).json({
        message: 'Cart retrieved successfully.',
        cart: {
          userId: cart.userId,
          items: cartDetails,
        },
      });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
      return;
    }
  });


router.post('/api/cart/add',authenticate, async (req, res): Promise<void> => {
  const userId = req.headers["x-user-id"];
  const { productId, quantity } = req.body;

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
    const userIdAsNumber = Number(userId);
    // 3. Ensure the user has a cart (create one if it doesn't exist)
    const cart = await prisma.cart.upsert({
      where: { userId:userIdAsNumber },
      create: { userId:userIdAsNumber },
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

router.post('/api/cart/remove', authenticate, async (req, res): Promise<void> => {
  const userId = req.headers["x-user-id"];
  const { cartItemId, quantity } = req.body;

  try {
    // 1. Validate input
    if (!userId || !cartItemId || !quantity || quantity <= 0) {
      res.status(400).json({ message: 'Invalid input data.' });
      return;
    }

    const userIdAsNumber = Number(userId);

    // 2. Find the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!cartItem) {
      res.status(404).json({ message: 'Cart item not found.' });
      return;
    }

    if (cartItem.quantity < quantity) {
      res.status(400).json({
        message: `Cannot remove more than present in cart. Current quantity: ${cartItem.quantity}`,
      });
      return;
    }

    // 3. Update or remove the cart item
    if (cartItem.quantity === quantity) {
      // Remove item if quantity becomes zero
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // Decrease quantity
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: { decrement: quantity } },
      });
    }

    // 4. Restore product stock
    await prisma.product.update({
      where: { id: cartItem.productId },
      data: { stock: { increment: quantity } },
    });

    res.status(200).json({ message: 'Item removed from cart successfully.' });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
});


export default router;