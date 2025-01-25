export interface Product {
    id: number
    name: string
    description: string
    price: number
    stock: number
    categoryId: number
    images: ProductImage[]
    isArchived?: boolean
  }
  
  export interface Category {
    id: number
    name: string
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
    altText: string
    createdAt: string
    productId: number
  }
  
  