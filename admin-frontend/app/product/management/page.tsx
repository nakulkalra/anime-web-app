"use client"
import type React from "react"
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit2, Delete, Archive } from "lucide-react"
import ProductDialog from "./ProductDialog";
import type { Product, Category, FormData } from "./types";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          axios.get("http://localhost:4000/api/admin/products"),
          axios.get("http://localhost:4000/api/admin/categories"),
        ])
        setProducts(productResponse.data.products)
        setCategories(categoryResponse.data.categories)
        
    } catch (error) {
        console.error("Error fetching data:", error)
    }
}

    fetchData()
    
    
  }, [])
  useEffect(() => {
    console.log(products);  // Now this will log the updated value of products
  }, [products]); 

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
      const response = await axios.post("http://localhost:4000/api/admin/products", form)
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
        const res = await axios.post(
            'http://localhost:4000/api/admin/product/toggle-archive',
            { id: product.id }, 
            {withCredentials:true }
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
      await axios.put(`http://localhost:4000/api/admin/products/${editingProductId}`, form)

      const productResponse = await axios.get("http://localhost:4000/api/admin/products")
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

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId.toString(),
      productImages: product.images,
      imageUrl: "",
    })
    setIsEditDialogOpen(true)
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
      <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Products</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Product
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="ml-2 p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{categories.find((cat) => cat.id === product.categoryId)?.name || "Unknown"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleArchiveToggle(product)}
                        className={product.isArchived ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-emerald-700 text-white hover:bg-emerald-600 hover:text-black'}
                        
                        >
                        <Archive className="h-4 w-4" />
                        </Button>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        form={form}
        onFieldChange={handleFieldChange}
        onCategoryChange={handleCategoryChange}
        onImagesChange={handleImagesChange}
        onSubmit={handleCreate}
        categories={categories}
      />

      <ProductDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        form={form}
        onFieldChange={handleFieldChange}
        onCategoryChange={handleCategoryChange}
        onImagesChange={handleImagesChange}
        onSubmit={handleEdit}
        categories={categories}
      />
    </div>
  )
}

export default AdminProductManagement

