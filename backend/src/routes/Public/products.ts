import express, { Request, Response, Router } from 'express';
import prisma from '../../lib/prisma';

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

// Define types for query parameters
interface ProductQuery {
  page?: string; // Optional query parameter, passed as string
  limit?: string;
  name?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  stockStatus?: string;
}

/**
 * GET /products
 * Fetch all products with pagination and filtering
 */
router.get('/api/products', async (req: Request<{}, {}, {}, ProductQuery>, res: Response) => {
  try {
    const {
      page = '1', // Default to page 1
      limit = '10', // Default page size
      name, // Filter by product name (partial match)
      categoryId, // Filter by category ID
      minPrice, // Minimum price filter
      maxPrice, // Maximum price filter
      stockStatus, // New: Filter by stockStatus
    } = req.query;

    // Parse pagination parameters
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const offset = (pageNumber - 1) * pageSize;

    // Build the Prisma query object
    const filters: Record<string, any> = {
      isArchived: false, // Exclude archived products by default
    };

    if (name) {
      filters.name = { contains: name, mode: 'insensitive' }; // Case-insensitive match
    }

    if (categoryId) {
      filters.categoryId = parseInt(categoryId, 10);
    }

    if (minPrice || maxPrice) {
      filters.price = {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      };
    }

    // Handle stockStatus filtering
    if (stockStatus) {
      if (stockStatus === 'in_stock') {
        filters.stock = { gt: 0 }; // Filter products with stock greater than 0
      } else if (stockStatus === 'low_stock') {
        filters.stock = { lte: 5, gt: 0 }; // Filter products with stock between 1 and 5
      } else if (stockStatus === 'out_of_stock') {
        filters.stock = 0; // Filter products with 0 stock
      }
    }

    // Fetch products from the database
    const products = await prisma.product.findMany({
      where: filters,
      skip: offset,
      take: pageSize,
      include: {
        category: true,
        images: true,
        sizes: true,
      },
    });

    // Count total products matching the filters
    const totalProducts = await prisma.product.count({
      where: filters,
    });

    // Map through the products to modify the stock status based on sizes
    const modifiedProducts = products.map(product => {
      // Calculate total stock across all sizes
      const totalStock = product.sizes.reduce((sum, size) => sum + size.quantity, 0);
      
      let stockStatus = 'in_stock';
      if (totalStock === 0) {
        stockStatus = 'out_of_stock';
      } else if (totalStock <= 5) {
        stockStatus = 'low_stock';
      }

      // Remove 'stock' field and add 'stockStatus'
      const { stock, ...productWithoutStock } = product;

      return {
        ...productWithoutStock,
        stockStatus,
      };
    });

    res.json({
      success: true,
      data: modifiedProducts,
      meta: {
        total: totalProducts,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalProducts / pageSize),
      },
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch products');
  }
});





// Get all categories
router.get('/api/product/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany(
      {
        select: {
          id: true,
          name: true,
          description: true,
                
        }
      }
    );
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error });
  }
});

export default router;
