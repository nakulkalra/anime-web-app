export interface Product {
    id: number
    name: string
    description: string
    price: number
    stock: number
    categoryId: number
    category?: Category
    images: ProductImage[]
    sizes: ProductSize[]
    isArchived: boolean
  }
  
  export interface Category {
    id: number
    name: string
    description: string
  }
  
  export interface FormData {
    name: string
    description: string
    price: number
    stock: number
    categoryId: string
    productImages: any
    imageUrl?: string
    isArchived?: boolean
  }
  
  export interface ProductImage {
    id: number
    url: string
    altText?: string
    productId: number
  }
  
  export interface ProductSize {
    id: number
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL'
    quantity: number
    productId: number
  }
  
  export interface ProductFormData {
    name: string
    description: string
    price: number
    stock: number
    categoryId: number
    images: string[]
    sizes: Omit<ProductSize, 'id' | 'productId'>[]
  }
  
  export interface ApiResponse {
    success: boolean
    message?: string
    product?: Product
    products?: Product[]
    error?: string
  }
  
  