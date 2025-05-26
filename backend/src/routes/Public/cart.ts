import express, { Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate } from '../../auth';
import { Cart, CartItem, Product, ItemSize } from '@prisma/client';

type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product & {
      sizes: {
        id: number;
        productId: number;
        size: ItemSize;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
      }[];
    };
  })[];
};

const router: Router = express.Router();

router.get('/api/cart', authenticate, async (req, res): Promise<void> => {
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
            product: {
              include: {
                sizes: true
              }
            },
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
      size: item.size,
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

router.post('/api/cart/add', authenticate, async (req, res): Promise<void> => {
  const userId = req.headers["x-user-id"];
  const { productId, quantity, size } = req.body;

  try {

    if (!productId) {
      res.status(400).json({ message: 'Product ID is required.' });
      return;
    }

    if (!quantity || quantity <= 0) {
      res.status(400).json({ message: 'Valid quantity is required.' });
      return;
    }

    if (!size) {
      res.status(400).json({ message: 'Size is required.' });
      return;
    }

    // 2. Check if the product exists and has the requested size in stock
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        sizes: true
      }
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    const productSize = product.sizes.find(ps => ps.size === size);
    if (!productSize) {
      res.status(400).json({ message: `Size ${size} not available for this product.` });
      return;
    }

    if (productSize.quantity < quantity) {
      res.status(400).json({ 
        message: `Not enough stock available for size ${size}. Current stock: ${productSize.quantity}` 
      });
      return;
    }

    const userIdAsNumber = Number(userId);
    // 3. Ensure the user has a cart (create one if it doesn't exist)
    const cart = await prisma.cart.upsert({
      where: { userId: userIdAsNumber },
      create: { userId: userIdAsNumber },
      update: {},
    });

    // 4. Add or update the product in the cart
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId: Number(productId),
          size: size
        },
      },
      create: {
        cartId: cart.id,
        productId: Number(productId),
        size: size,
        quantity: quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
    });

    res.status(200).json({
      message: 'Product added to cart successfully.',
      cartItem,
    });
    return;
  } catch (error) {
    console.error('Cart Add Error:', error);
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
      include: { 
        product: {
          include: {
            sizes: true
          }
        } 
      },
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

    res.status(200).json({ message: 'Item removed from cart successfully.' });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
});

// Get quantity of a product in cart
router.get('/api/cart/quantity/:productId', authenticate, async (req, res): Promise<void> => {
  const userId = req.headers["x-user-id"] as string;
  const { productId } = req.params;
  const { size } = req.query;

  try {
    if (!size) {
      res.status(400).json({ message: 'Size is required.' });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        items: {
          where: {
            productId: parseInt(productId),
            size: size as ItemSize
          }
        }
      }
    }) as CartWithItems | null;

    if (!cart) {
      res.status(200).json({ quantity: 0 });
      return;
    }

    const cartItem = cart.items[0];
    res.status(200).json({ quantity: cartItem ? cartItem.quantity : 0 });
    return;
  } catch (error) {
    console.error('Error getting cart quantity:', error);
    res.status(500).json({ message: 'Failed to get cart quantity' });
  }
});

// Update cart item quantity
router.post('/api/cart/update', authenticate, async (req, res): Promise<void> => {
  const userId = req.headers["x-user-id"] as string;
  const { productId, quantity, size } = req.body;

  try {
    // 1. Validate input
    if (!userId || !productId || quantity === undefined || quantity < 0 || !size) {
      res.status(400).json({ message: 'Invalid input data. Product ID, quantity, and size are required.' });
      return;
    }

    // 2. Check if the product exists and has the requested size in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        sizes: true
      }
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    const productSize = product.sizes.find(ps => ps.size === size);
    if (!productSize) {
      res.status(400).json({ message: `Size ${size} not available for this product.` });
      return;
    }

    if (quantity > 0 && productSize.quantity < quantity) {
      res.status(400).json({ 
        message: `Not enough stock available for size ${size}. Current stock: ${productSize.quantity}` 
      });
      return;
    }

    // 3. Get or create user's cart
    const cart = await prisma.cart.upsert({
      where: { userId: parseInt(userId) },
      create: { userId: parseInt(userId) },
      update: {},
    });

    // 4. Update or remove the cart item
    if (quantity === 0) {
      // Remove item if quantity is zero
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: productId,
          size: size
        },
      });
      res.status(200).json({ message: 'Item removed from cart successfully.' });
      return;
    }

    // Update quantity
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId: productId,
          size: size
        },
      },
      create: {
        cartId: cart.id,
        productId: productId,
        size: size,
        quantity: quantity,
      },
      update: {
        quantity: quantity,
      },
    });

    res.status(200).json({
      message: 'Cart updated successfully.',
      cartItem,
    });
    return;
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart' });
    return;
  }
});

export default router;