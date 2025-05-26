"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ProductList } from "./ProductList"
import { SearchBar } from "./SearchBar"
import { FilterSidebar } from "./FilterSidebar"
import type { Product, FilterOptions, Category } from "../../types/product"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProductData = async (page: number, query: string, currentFilters: FilterOptions) => {
    setIsLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(query && { name: query }),
        ...(currentFilters.category && { categoryId: currentFilters.category.toString() }),
        ...(currentFilters.minPrice && { minPrice: currentFilters.minPrice.toString() }),
        ...(currentFilters.maxPrice && { maxPrice: currentFilters.maxPrice.toString() }),
        ...(currentFilters.stockStatus && typeof currentFilters.stockStatus === 'string' && { stockStatus: currentFilters.stockStatus }),
      })

      const response = await fetch(`http://localhost:4000/api/products?${queryParams}`)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      setProducts(data.data)
      setTotalPages(data.meta.totalPages)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch products. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/product/categories")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Optionally set an error state for categories
    }
  }

  const memoizedFetchProductData = useCallback(fetchProductData, [])

  useEffect(() => {
    memoizedFetchProductData(currentPage, searchQuery, filters)
  }, [currentPage, searchQuery, filters, memoizedFetchProductData])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => memoizedFetchProductData(currentPage, searchQuery, filters)} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className="flex">
        <FilterSidebar categories={categories} onFilterChange={handleFilterChange} />
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : (
          <ProductList
            products={products}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}

