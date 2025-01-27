import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Product } from "../../types/product"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="aspect-square relative mb-4">
          <Image
            src={product.images[0]?.url || "/placeholder.svg"}
            alt={product.images[0]?.altText || product.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
        <p className="text-sm mb-2">{product.description}</p>
        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}

