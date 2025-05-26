import express, { Request, Response, Router } from 'express';
import prisma from '../../../lib/prisma';
import { ItemSize } from '@prisma/client';

const router: Router = express.Router();

/**
 * Utility function to handle errors and send consistent responses.
 */
const handleError = (res: Response, error: any, message: string) => {
  console.error(message, error);
  res.status(500).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : error,
  });
};

// Add New Product with Images and Sizes
router.post('/api/admin/products', async (req, res): Promise<void> => {
  let { name, description, price, stock, categoryId, images, sizes } = req.body;

  price = parseFloat(price);
  stock = parseInt(stock);
  categoryId = parseInt(categoryId);

  // Validate required fields
  if (!name || !description || price === undefined || categoryId === undefined) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields',
    });
    return;
  }

  // Ensure images is an array and filter out empty strings
  if (images) {
    images = Array.isArray(images) ? images.filter(url => url.trim()) : [images].filter(url => url.trim());
  } else {
    images = [];
  }

  // Validate sizes
  if (!sizes || !Array.isArray(sizes)) {
    res.status(400).json({
      success: false,
      message: 'Sizes array is required',
    });
    return;
  }

  try {
    // Create the product with sizes and images
    const product = await prisma.product.create({
      data: { 
        name, 
        description, 
        price, 
        stock, 
        categoryId,
        images: {
          create: images.map((url: string) => ({ url: url.trim() }))
        },
        sizes: {
          create: sizes.map((size: { size: ItemSize, quantity: number }) => ({
            size: size.size,
            quantity: size.quantity
          }))
        }
      },
      include: {
        images: true,
        sizes: true,
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    handleError(res, error, 'Failed to create product');
  }
});

router.put('/api/admin/products/:id', async (req, res): Promise<void> => {
  const { id } = req.params;
  let { name, description, price, stock, categoryId, isArchived, images, sizes } = req.body;

  price = parseFloat(price);
  stock = parseInt(stock);
  categoryId = parseInt(categoryId);

  // Validate ID parameter
  if (!id) {
    res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
    return;
  }

  // Ensure at least one field to update is provided
  if (!name && !description && price === undefined && stock === undefined && !categoryId && isArchived === undefined && !images && !sizes) {
    res.status(400).json({
      success: false,
      message: 'No fields to update were provided',
    });
    return;
  }

  try {
    // Update product data
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { 
        name, 
        description, 
        price, 
        stock, 
        categoryId, 
        isArchived 
      },
      include: {
        images: true,
        sizes: true
      }
    });

    // If sizes are provided, update the product's sizes
    if (sizes && Array.isArray(sizes)) {
      // First, remove existing sizes for the product
      await prisma.productSize.deleteMany({
        where: {
          productId: product.id,
        },
      });

      // Create new sizes for the product
      await prisma.productSize.createMany({
        data: sizes.map((size: { size: ItemSize, quantity: number }) => ({
          size: size.size,
          quantity: size.quantity,
          productId: product.id,
        })),
      });
    }

    // If images are provided, update the product's images
    if (images && Array.isArray(images)) {
      // Filter out empty strings and trim URLs
      const validImages = images.filter(url => url.trim());
      
      // Remove existing images
      await prisma.productImage.deleteMany({
        where: {
          productId: product.id,
        },
      });

      // Create new images
      await prisma.productImage.createMany({
        data: validImages.map(url => ({
          url: url.trim(),
          productId: product.id,
        })),
      });
    }

    // Fetch the updated product with all relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        sizes: true,
        category: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    handleError(res, error, 'Failed to update product');
  }
});

// Get All Products
router.get('/api/admin/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        sizes: true,
      },
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch products');
  }
});

// Get all categories
router.get('/api/admin/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error });
  }
});

// Route to delete a specific product image
router.post('/api/admin/product/toggle-archive', async (req, res): Promise<void> => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ error: 'Product ID is required' });
    return;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizes: true
      }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        isArchived: !product.isArchived,
      },
      include: {
        sizes: true
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Product archived status updated', 
      product: updatedProduct 
    });
  } catch (error) {
    console.error('Error updating product archived status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Single Product by ID
router.get('/api/admin/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
    return;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        sizes: true,
        category: true
      }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch product');
  }
});

export default router;
