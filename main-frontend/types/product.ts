export interface Product {
    id: number
    name: string
    description: string
    price: number
    stock: number
    isArchived: boolean
    createdAt: string
    updatedAt: string
    categoryId: number
    category: Category
    images: Image[]
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
    altText: string
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
    inStock?: boolean
    stockStatus?: string[] 
  }
  
  