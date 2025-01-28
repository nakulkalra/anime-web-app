import React, { useState, useCallback, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection('right');
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  }, [product.images.length]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection('left');
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  }, [product.images.length]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (direction) {
      timer = setTimeout(() => setDirection(null), 300);
    }
    return () => clearTimeout(timer);
  }, [direction]);

  const getSlideAnimation = () => {
    if (!direction) return '';
    return direction === 'right' 
      ? 'animate-slide-left' 
      : 'animate-slide-right';
  };

  const handleAddtoCart = (product: Product['id']) => {
    console.log(product);
    
  };

  return (
    <Card 
      className="w-full group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div 
          className="aspect-square relative mb-4 overflow-hidden rounded-lg"
          style={{ backgroundColor: '#f8f8f8' }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          
          <div className={`relative w-full h-full ${getSlideAnimation()}`}>
            <Image
              src={product.images[currentImageIndex]?.url || "/placeholder.svg"}
              alt={product.images[currentImageIndex]?.altText || product.name}
              layout="fill"
              objectFit="cover"
              className={`transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoadingComplete={handleImageLoad}
            />
          </div>

          {product.images.length > 1 && (
            <>
              <div 
                role="button"
                tabIndex={0}
                onClick={prevImage}
                className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300 cursor-pointer z-10 ${
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </div>
              
              <div
                role="button"
                tabIndex={0}
                onClick={nextImage}
                className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300 cursor-pointer z-10 ${
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </div>

              <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 z-10 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 transform cursor-pointer ${
                      currentImageIndex === index 
                        ? 'bg-white scale-125 shadow-lg' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 tracking-wide">
            {product.category.name}
          </p>
          <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          <p className="text-lg font-bold">Rs. {product.price.toFixed(2)}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full group relative overflow-hidden transition-all hover:shadow-md"
          onClick={() => handleAddtoCart(product.id)}
        >
          <span className="flex items-center justify-center gap-2 transition-transform group-hover:scale-105">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;