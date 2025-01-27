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

    // Fetch products from the database
    const products = await prisma.product.findMany({
      where: filters,
      skip: offset,
      take: pageSize,
      include: {
        category: true,
        images: true,
      },
    });

    // Count total products matching the filters
    const totalProducts = await prisma.product.count({
      where: filters,
    });

    res.json({
      success: true,
      data: products,
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

export default router;
