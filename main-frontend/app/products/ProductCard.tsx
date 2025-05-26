import React, { useState } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "../../types/product";
import { ProductDialog } from "./ProductDialog";
import { useCart } from "@/hooks/use-cart";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addToCart, removeFromCart, getCartQuantity, isAddingToCart } = useCart();

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = (size: string) => {
    addToCart(product.id, size);
  };

  const handleRemoveFromCart = (size: string) => {
    removeFromCart(product.id, size);
  };

  const cartQuantity = getCartQuantity(product.id);

  return (
    <>
      <Card className="group relative overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square">
          <Image
            src={product.images[currentImageIndex]?.url || "/placeholder.svg"}
            alt={product.images[currentImageIndex]?.altText || product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={previousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category.name}</p>
            <p className="text-lg font-bold">Rs. {product.price.toFixed(2)}</p>
            
            {/* Size Availability */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex gap-1">
                {product.sizes.map((size) => (
                  <div
                    key={size.size}
                    className={`text-xs px-2 py-1 rounded-full ${
                      size.quantity > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {size.size}: {size.quantity}
                  </div>
                ))}
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              className="w-full group relative overflow-hidden transition-all hover:shadow-md"
              onClick={() => setIsDialogOpen(true)}
            >
              <span className="flex items-center justify-center gap-2 transition-transform group-hover:scale-105">
                <ShoppingCart className="h-4 w-4" />
                {cartQuantity > 0 ? `In Cart (${cartQuantity})` : 'Add to Cart'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductDialog
        product={product}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        cartQuantity={cartQuantity}
        isAddingToCart={isAddingToCart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />
    </>
  );
}

export default ProductCard;