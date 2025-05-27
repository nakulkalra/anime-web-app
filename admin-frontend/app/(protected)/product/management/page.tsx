"use client"
import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit2, Delete, Archive } from "lucide-react"
import ProductDialog from "./ProductDialog";
import type { Product, Category, FormData, ProductFormData } from "./types";
import { ProductForm } from './ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/axios';

const AdminProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    productImages: [],
    imageUrl: "",
    isArchived:false,
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get("/api/admin/products"),
        api.get("/api/admin/categories")
      ]);
      setProducts(productsResponse.data.products);
      setCategories(categoriesResponse.data.categories);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFieldChange = useCallback((name: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, categoryId: value }))
  }, [])

  const handleImagesChange = useCallback((images: string[]) => {
    setForm((prev) => ({ ...prev, productImages: images }))
  }, [])

  const handleCreate = async () => {
    try {
      const response = await api.post("/api/admin/products", form)
      setProducts((prev) => [...prev, response.data.product])
      setIsCreateDialogOpen(false)
      setForm({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        categoryId: "",
        productImages: [],
        imageUrl: "",
      })
    } catch (error) {
      console.error("Error creating product:", error)
    }
  }

  const handleArchiveToggle = async (product:Product) => {
    try {
        const res = await api.post(
            '/api/admin/product/toggle-archive',
            { id: product.id }
          )

          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === product.id ? { ...p, isArchived: !p.isArchived } : p
            )
          );
                  
    } catch (error) {
        console.error("Error editing product:", error);
    }
  }

  const handleEdit = async () => {
    if (editingProductId === null) return

    try {
      await api.put(`/api/admin/products/${editingProductId}`, form)

      const productResponse = await api.get("/api/admin/products")
      setProducts(productResponse.data.products)

      setIsEditDialogOpen(false)
      setEditingProductId(null)
      setForm({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        categoryId: "",
        productImages: [],
        imageUrl: "",
        isArchived:false
      })
    } catch (error) {
      console.error("Error editing product:", error)
    }
  }

  const handleEditProduct = async (product: Product) => {
    try {
      const response = await api.get(`/api/admin/products/${product.id}`);
      const productData = response.data.product;
      
      setSelectedProduct(productData);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: 'Error',
        description: 'Failed to fetch product details',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const url = selectedProduct
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products';

      const method = selectedProduct ? 'put' : 'post';
      const response = await api[method](url, data);

      const result = await response.data;

      if (result.success) {
        toast({
          title: 'Success',
          description: `Product ${selectedProduct ? 'updated' : 'created'} successfully`,
        });
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        throw new Error(result.message || 'Failed to save product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (product: Product) => {
    try {
      const response = await api.post(
        '/api/admin/product/toggle-archive',
        { id: product.id }
      );

      const result = await response.data;

      if (result.success) {
        toast({
          title: 'Success',
          description: `Product ${product.isArchived ? 'unarchived' : 'archived'} successfully`,
        });
        fetchProducts();
      } else {
        throw new Error(result.message || 'Failed to update product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={() => {
          setSelectedProduct(null);
          setIsEditDialogOpen(true);
        }}>
          Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 space-y-4">
            <div className="aspect-square relative">
              {product.images[0] && (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.description}</p>
              <p className="font-bold">CA$ {product.price.toFixed(2)}</p>
              
              {/* Size Availability */}
              <div className="mt-2 flex gap-1">
                {product.sizes.map((size) => (
                  <span
                    key={size.size}
                    className={`text-xs px-2 py-1 rounded-full ${
                      size.quantity > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {size.size}: {size.quantity}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleEditProduct(product)}
              >
                Edit
              </Button>
              <Button
                variant={product.isArchived ? "default" : "destructive"}
                onClick={() => handleArchive(product)}
              >
                {product.isArchived ? 'Unarchive' : 'Archive'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={selectedProduct ? {
              name: selectedProduct.name,
              description: selectedProduct.description,
              price: selectedProduct.price,
              stock: selectedProduct.stock,
              categoryId: selectedProduct.categoryId,
              images: selectedProduct.images.map(img => img.url),
              sizes: selectedProduct.sizes.map(({ id, productId, ...size }) => size)
            } : undefined}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminProductManagement

