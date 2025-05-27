import express, { Request, Response, Router } from 'express';
import prisma from '../../../lib/prisma';
import { OrderStatus, Prisma } from '@prisma/client';
import  { adminAuthenticate }  from '@/auth';
const router: Router = express.Router();

// Get all orders with pagination and search
router.get('/api/admin/orders', adminAuthenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string;
    const statusFilter = status === 'ALL' ? undefined : status as OrderStatus;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(search && {
        OR: [
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(statusFilter && { status: statusFilter }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
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
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details
router.get('/api/admin/orders/:id', adminAuthenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
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

// Update order status
router.patch('/api/admin/orders/:id/status', adminAuthenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const orderId = parseInt(req.params.id);

    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;