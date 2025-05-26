import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export function useCart() {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});

  const getCartQuantity = useCallback((productId: number) => {
    return cartItems[productId] || 0;
  }, [cartItems]);

  const addToCart = useCallback(async (productId: number, size: string) => {
    setIsAddingToCart(true);
    try {
      const response = await fetch("http://localhost:4000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
          size,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      setCartItems(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1
      }));

      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, []);

  const removeFromCart = useCallback(async (productId: number, size: string) => {
    setIsAddingToCart(true);
    try {
      const response = await fetch("http://localhost:4000/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
          size,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove from cart");
      }

      setCartItems(prev => ({
        ...prev,
        [productId]: Math.max(0, (prev[productId] || 0) - 1)
      }));

      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, []);

  return {
    addToCart,
    removeFromCart,
    getCartQuantity,
    isAddingToCart,
  };
} 