export interface Product {
    id: number
    name: string
    description: string | null
    price: number
    stock: number
    isArchived: boolean
    createdAt: string
    updatedAt: string
    categoryId: number
    category: Category
    images: Image[]
    sizes: Size[]
  }
  
  export interface Category {
    id: number
    name: string
    description: string
    createdAt?: string
    updatedAt?: string
  }
  
  export interface Image {
    id: number
    url: string
    altText: string | null
    createdAt: string
    productId: number
  }
  
  export interface ApiResponse {
    success: boolean
    data: Product[]
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
  
  export interface FilterOptions {
    category?: number
    minPrice?: number
    maxPrice?: number
    stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  }
  
  export interface Size {
    id: number
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL'
    quantity: number
  }
  
  