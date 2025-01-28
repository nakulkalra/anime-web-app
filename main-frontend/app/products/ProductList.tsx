import { ProductCard } from "./ProductCard"
import { Pagination } from "./Pagination"
import type { Product } from "../../types/product"

interface ProductListProps {
  products: Product[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductList({ products, currentPage, totalPages, onPageChange }: ProductListProps) {
  return (
    <div className="flex-1 ml-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}

