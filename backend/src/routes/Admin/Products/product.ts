import express, { Request, Response, Router } from 'express';
import prisma from '../../../lib/prisma';

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

// Add New Product
router.post('/api/admin/products', async (req, res):Promise<void> => {
    let { name, description, price, stock, categoryId } = req.body;

    price = parseFloat(price);
    stock = parseInt(stock);
    categoryId = parseInt(categoryId);


  // Validate required fields
  if (!name || !price || !stock || !categoryId) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields: name, price, stock, or categoryId',
    });
    return;
  }

  try {
    const product = await prisma.product.create({
      data: { name, description, price, stock, categoryId },
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

// Edit Product (including Archiving)
router.put('/api/admin/products/:id', async (req, res):Promise<void> => {
  const { id } = req.params;
  let { name, description, price, stock, categoryId,isArchived } = req.body;

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
  if (!name && !description && price === undefined && stock === undefined && !categoryId && isArchived === undefined) {
    res.status(400).json({
      success: false,
      message: 'No fields to update were provided',
    });
    return;
  }

  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, price, stock, categoryId, isArchived },
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    handleError(res, error, 'Failed to update product');
  }
});

// Get All Products (Including Archived)
router.get('/api/admin/products', async (req: Request, res: Response) => {
  const { includeArchived } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: includeArchived === 'true' ? undefined : { isArchived: false },
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

export default router;
