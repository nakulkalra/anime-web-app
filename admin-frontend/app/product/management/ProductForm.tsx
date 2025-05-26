import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import CategorySelect from './CategorySelect';
import { toast } from '@/hooks/use-toast';
import type { ProductFormData, ProductSize, Category } from './types';
import axios from 'axios';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().min(0, 'Stock must be positive'),
  categoryId: z.number().min(1, 'Category is required'),
  images: z.array(z.string()),
  sizes: z.array(z.object({
    size: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
    quantity: z.number().min(0, 'Quantity must be positive')
  }))
});

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProductForm({ initialData, onSubmit, isSubmitting }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [sizes, setSizes] = useState<Omit<ProductSize, 'id' | 'productId'>[]>(initialData?.sizes || []);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/admin/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch categories',
          variant: 'destructive',
        });
      }
    };

    fetchCategories();
  }, []);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      stock: initialData?.stock || 0,
      categoryId: initialData?.categoryId || 0,
      images: initialData?.images || [],
      sizes: initialData?.sizes || []
    }
  });

  const handleImageAdd = (url: string) => {
    if (!url.trim()) return;
    const newImages = [...images, url.trim()];
    setImages(newImages);
    form.setValue('images', newImages);
  };

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setValue('images', newImages);
  };

  const handleSizeQuantityChange = (size: typeof AVAILABLE_SIZES[number], quantity: number) => {
    const existingSizeIndex = sizes.findIndex(s => s.size === size);
    let newSizes: Omit<ProductSize, 'id' | 'productId'>[];

    if (existingSizeIndex >= 0) {
      newSizes = sizes.map((s, index) => 
        index === existingSizeIndex ? { ...s, quantity } : s
      );
    } else {
      newSizes = [...sizes, { size, quantity }];
    }

    setSizes(newSizes);
    form.setValue('sizes', newSizes);
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const formData = {
        ...data,
        images: images
      };
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: 'Product saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategorySelect
                  value={field.value.toString()}
                  onChange={(value) => field.onChange(parseInt(value))}
                  categories={categories}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Size Management */}
        <div className="space-y-4">
          <FormLabel>Sizes</FormLabel>
          <div className="grid grid-cols-5 gap-4">
            {AVAILABLE_SIZES.map((size) => (
              <div key={size} className="space-y-2">
                <FormLabel>{size}</FormLabel>
                <Input
                  type="number"
                  min="0"
                  value={sizes.find(s => s.size === size)?.quantity || 0}
                  onChange={(e) => handleSizeQuantityChange(size, parseInt(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Image Management */}
        <div className="space-y-4">
          <FormLabel>Images</FormLabel>
          <div className="space-y-2">
            {images.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={url} readOnly />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleImageRemove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Image URL"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      handleImageAdd(input.value);
                      input.value = '';
                    }
                  }
                }}
              />
              <Button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input.value.trim()) {
                    handleImageAdd(input.value);
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
}

