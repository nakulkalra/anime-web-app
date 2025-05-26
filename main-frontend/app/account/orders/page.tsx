'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    size: string;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: number;
    };
  }>;
  payment: {
    status: string;
    amount: number;
  };
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/account/orders', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-500',
      PROCESSING: 'bg-blue-500',
      SHIPPED: 'bg-purple-500',
      DELIVERED: 'bg-green-500',
      CANCELLED: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  <CardDescription>
                    {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge
                    className={
                      order.payment.status === 'PAID'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }
                  >
                    {order.payment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      {order.items.length} items
                    </p>
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDialogOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Order Information</h3>
                  <p>Date: {format(new Date(selectedOrder.createdAt), 'PPpp')}</p>
                  <p>Status: {selectedOrder.status}</p>
                  <p>Total: ${selectedOrder.total.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Payment Information</h3>
                  <p>Status: {selectedOrder.payment.status}</p>
                  <p>Amount: ${selectedOrder.payment.amount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Size: {item.size} | Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;
