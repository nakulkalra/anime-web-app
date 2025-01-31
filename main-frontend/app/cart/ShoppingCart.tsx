"use client"

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart } from "lucide-react"
import { toast } from '@/hooks/use-toast';

interface CartItem {
  cartItemId: number
  productId: number
  name: string
  description: string
  price: number
  quantity: number
  totalPrice: number
}

interface CartData {
  userId: number
  items: CartItem[]
}

export default function ShoppingCartComponent() {
  const [cart, setCart] = useState<CartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
//   const { toast } = useToast()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:4000/api/cart", {
        credentials: "include", // This is important to send cookies
      })
      const data = await response.json()
      if (response.ok) {
        setCart(data.cart)
        setError(null)
      } else {
        setError(data.message)
        setCart(null)
      }
    } catch (err) {
      setError("Failed to fetch cart data")
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      const response = await fetch("http://localhost:4000/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId, // Sending cartItemId instead of productId
          quantity: 1, // Adjust as needed
        }),
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to remove item from cart.");
      }
  
      toast({
        title: "Success",
        description: data.message || "Item removed from cart successfully.",
      });
  
      // Update the cart state by filtering out the removed item
      setCart((prevCart) => {
        if (!prevCart) return prevCart;
  
        const updatedItems = prevCart.items
          .map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity - 1, totalPrice: (item.quantity - 1) * item.price }
              : item
          )
          .filter((item) => item.quantity > 0); // Remove if quantity is zero
  
        return { ...prevCart, items: updatedItems };
      });
    } catch (error: any) {
      console.error("Error removing item from cart:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  
  

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        {error === "User ID is required." && (
          <Button
            onClick={() => {
              window.location.href = '/Login';
            }}
          >
            Log In
          </Button>
        )}
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-xl font-semibold">Your cart is empty</p>
      </div>
    )
  }

  const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2" />
          Your Shopping Cart
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cart.items.map((item) => (
          <div key={item.cartItemId} className="flex items-center justify-between py-4">
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="text-sm">Quantity: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
              <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.cartItemId)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">Total:</p>
          <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
        </div>
        <Button size="lg">Proceed to Checkout</Button>
      </CardFooter>
    </Card>
  )
}

