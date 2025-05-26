"use client";
import React, { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit2, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  images: string[];  // Add images property
}

interface Category {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  productImages: (string | ProductImage)[];
  imageUrl?: string;
}
interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  createdAt: string;
  productId: number;
}

// Memoized input component
const FormInput = memo(({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  name, 
  placeholder 
}: { 
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full"
    />
  </div>
));

FormInput.displayName = 'FormInput';

// Memoized select component
const CategorySelect = memo(({ 
  value, 
  onChange, 
  categories 
}: { 
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
}) => (
  <div className="space-y-2">
    <Label htmlFor="category">Category</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id.toString()}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
));

CategorySelect.displayName = 'CategorySelect';

// Memoized form component
const ProductForm = memo(({ 
  form, 
  onFieldChange,
  onCategoryChange,
  onImagesChange,
  categories 
}: { 
  form: FormData;
  onFieldChange: (name: string, value: string | number) => void;
  onCategoryChange: (value: string) => void;
  onImagesChange: (images: string[]) => void;
  categories: Category[];
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? Number(value) : value;
    onFieldChange(name, processedValue);
  }, [onFieldChange]);

  const handleImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? Number(value) : value;
    onFieldChange(name, processedValue);
  }, [onImagesChange]);

  const handleDeleteImage = (index:any) => {
    const updatedImages = form.productImages.filter((_, i) => i !== index);
    // setForm({ ...form, productImages: updatedImages });
  };
  

  return (
    <div className="space-y-4">
      <FormInput
        label="Product Name"
        name="name"
        value={form.name}
        onChange={handleInputChange}
        placeholder="Enter product name"
      />

      <FormInput
        label="Description"
        name="description"
        value={form.description}
        onChange={handleInputChange}
        placeholder="Enter product description"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Price"
          name="price"
          type="number"
          value={form.price}
          onChange={handleInputChange}
          placeholder="0.00"
        />

        <FormInput
          label="Stock"
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleInputChange}
          placeholder="0"
        />
      </div>

      <CategorySelect
        value={form.categoryId}
        onChange={onCategoryChange}
        categories={categories}
      />

      <div className="space-y-2">
      <FormInput
        label="Image URLs"
        name="imageUrl"
        value={form.imageUrl as string}
        onChange={handleImagesChange}
        placeholder="Enter product urls"
      />
        <div className="flex gap-2 mt-2">
  {form.productImages && form.productImages.length > 0 ? (
    form.productImages.map((img, index) => (
      <div 
        key={index} 
        className="relative group w-24 h-24"
      >
        {/* Image */}
        <img
          src={typeof img === 'string' ? img : img.url}
          alt={typeof img === 'object' && img.altText ? img.altText : `Product Image ${index + 1}`}
          className="w-full h-full object-cover rounded-lg group-hover:grayscale transition duration-200"
        />
        
        {/* Delete Icon */}
        <button
          onClick={() => handleDeleteImage(index)} // Define this function to handle delete logic
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition duration-200 rounded-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No images found</p>
  )}
</div>


      </div>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';

// Memoized dialog component
const ProductDialog = memo(({ 
  isOpen, 
  onOpenChange, 
  mode,
  form,
  onFieldChange,
  onCategoryChange,
  onImagesChange,
  onSubmit,
  categories
}: { 
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: FormData;
  onFieldChange: (name: string, value: string | number) => void;
  onCategoryChange: (value: string) => void;
  onImagesChange: (images: string[]) => void;
  onSubmit: () => void;
  categories: Category[];
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Create New Product' : 'Edit Product'}</DialogTitle>
      </DialogHeader>
      <ProductForm 
        form={form}
        onFieldChange={onFieldChange}
        onCategoryChange={onCategoryChange}
        onImagesChange={onImagesChange}
        categories={categories}
      />
      <DialogFooter className="flex space-x-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
));

ProductDialog.displayName = 'ProductDialog';

const AdminProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    productImages: [],
    imageUrl: '',
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          axios.get('/api/admin/products'),
          axios.get('/api/admin/categories'),
        ]);
        setProducts(productResponse.data.products);
        setCategories(categoryResponse.data.categories);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFieldChange = useCallback((name: string, value: string | number) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setForm(prev => ({ ...prev, categoryId: value }));
  }, []);

  const handleImagesChange = useCallback((images: string[]) => {
    setForm(prev => ({ ...prev, productImages: images }));
  }, []);

  const handleCreate = async () => {
    try {
      const response = await axios.post('/api/admin/products', form);
      setProducts(prev => [...prev, response.data.product]);
      setIsCreateDialogOpen(false);
      setForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: '',
        productImages: [],
      });
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleEdit = async () => {
    if (editingProductId === null) return;
  
    try {
      await axios.put(`/api/admin/products/${editingProductId}`, form);
      
      // Re-fetch products
      const productResponse = await axios.get('/api/admin/products');
      setProducts(productResponse.data.products);
      
      setIsEditDialogOpen(false);
      setEditingProductId(null);
      setForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: '',
        productImages: [],
      });
    } catch (error) {
      console.error('Error editing product:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId.toString(),
      productImages: product.images || [], // Use product's images or empty array
    });
    setIsEditDialogOpen(true);
  };
  


  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Products</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Product</Button>
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
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{categories.find(cat => cat.id === product.categoryId)?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                      <Edit2 className="h-4 w-4" />
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
  );
};

export default AdminProductManagement;
