import React, { useState } from 'react';
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "../../types/product";
import { toast } from '@/hooks/use-toast';

interface ProductDialogProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  cartQuantity: number;
  isAddingToCart: boolean;
  onAddToCart: (size: string) => void;
  onRemoveFromCart: (size: string) => void;
}

export function ProductDialog({
  product,
  isOpen,
  onClose,
  cartQuantity,
  isAddingToCart,
  onAddToCart,
  onRemoveFromCart,
}: ProductDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

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

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart",
        variant: "destructive"
      });
      return;
    }
    onAddToCart(selectedSize);
  };

  const handleRemoveFromCart = () => {
    if (!selectedSize) return;
    onRemoveFromCart(selectedSize);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left side - Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden group">
            <Image
              src={product.images[currentImageIndex]?.url || "/placeholder.svg"}
              alt={product.images[currentImageIndex]?.altText || product.name}
              fill
              className="object-cover"
            />
            {product.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={previousImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right side - Product Details */}
          <div className="flex flex-col space-y-4">
            <div>
              <p className="text-sm text-gray-500">{product.category.name}</p>
            </div>

            <p className="text-gray-600">{product.description}</p>

            <div className="space-y-2">
              <p className="text-2xl font-bold">CA$ {product.price.toFixed(2)}</p>
              
              {/* Size Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Size</p>
                <div className="flex gap-2">
                  {product.sizes && product.sizes.map((size) => (
                    <Button
                      key={size.size}
                      variant={selectedSize === size.size ? "default" : "outline"}
                      className={`w-12 h-12 relative ${
                        size.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => size.quantity > 0 && setSelectedSize(size.size)}
                      disabled={size.quantity === 0}
                    >
                      {size.size}
                      {size.quantity === 0 && (
                        <span className="absolute -top-1 -right-1 text-xs text-red-500">×</span>
                      )}
                    </Button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-sm text-gray-500">
                    Available: {product.sizes.find(s => s.size === selectedSize)?.quantity || 0}
                  </p>
                )}
              </div>
            </div>

            {/* Add to Cart / Quantity Controls */}
            <div className="pt-4">
              {cartQuantity > 0 ? (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveFromCart}
                    disabled={isAddingToCart}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold">{cartQuantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full group relative overflow-hidden transition-all hover:shadow-md"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  <span className="flex items-center justify-center gap-2 transition-transform group-hover:scale-105">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 