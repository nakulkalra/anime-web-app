import express, { Request, Response, Router } from 'express';
import prisma from '../../../lib/prisma';
import { authenticate } from '../../../auth';

const router: Router = express.Router();

// Get user's orders
router.get('/api/account/orders', authenticate, async (req: Request, res: Response):Promise<void> => {
  try {
    const userId = req.headers["x-user-id"] as string;

    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
    console.error('Error fetching orders:', error);
  }
});

// Get single order details
router.get('/api/account/orders/:id',authenticate, async (req: Request, res: Response):Promise<void> => {
  try {
    const userId = req.headers["x-user-id"] as string;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: parseInt(userId),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

export default router;
