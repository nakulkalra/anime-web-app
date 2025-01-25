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
// Add New Product with Images
router.post('/api/admin/products', async (req, res): Promise<void> => {
  let { name, description, price, stock, categoryId, productImages, imageUrl } = req.body;

  price = parseFloat(price);
  stock = parseInt(stock);
  categoryId = parseInt(categoryId);

  // Ensure productImages is an array, handle empty or invalid cases
  if (productImages) {
      productImages = Array.isArray(productImages) ? productImages : [productImages];
  } else {
      productImages = [];
  }

  // TypeScript type for product images (string URLs)
  type ProductImage = { url: string };

  try {
    // Create the product
    const product = await prisma.product.create({
      data: { 
        name, 
        description, 
        price, 
        stock, 
        categoryId,
        images: {
          create: productImages.map((image: string): ProductImage => ({ url: image })) // Create image URLs for the product
        },
      },
    });

    // If imageUrl (single image) is provided, handle it as well
    if (imageUrl) {
      await prisma.productImage.create({
        data: {
          url: imageUrl,
          productId: product.id,
        },
      });
    }

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
  let { name, description, price, stock, categoryId, isArchived, imageUrl, productImages } = req.body;

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
  if (!name && !description && price === undefined && stock === undefined && !categoryId && isArchived === undefined && !imageUrl && !productImages) {
    res.status(400).json({
      success: false,
      message: 'No fields to update were provided',
    });
    return;
  }

  try {
    // Update product data (name, description, price, stock, categoryId, isArchived)
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, price, stock, categoryId, isArchived },
    });

    // If productImages are provided, update the product's images
    if (productImages && Array.isArray(productImages)) {
      // Handle image objects (each having 'url' and 'altText')
      const updatedImages = productImages.map((image: { url: string, altText?: string }) => ({
        url: image.url,  // Make sure only the URL string is passed
        altText: image.altText || null, // Handle the altText if available
        productId: product.id,
      }));

      // First, remove existing images for the product
      await prisma.productImage.deleteMany({
        where: {
          productId: product.id,
        },
      });

      // Now, create new images for the product
      await prisma.productImage.createMany({
        data: updatedImages,
      });
    }

    // If imageUrl is provided (comma-separated list of images), handle it
    if (imageUrl) {
      // Split the imageUrl string into an array of URLs
      const imageUrlsArray = imageUrl.split(',');

      // Create new image entries for each URL
      const updatedImages = imageUrlsArray.map((url: string) => ({
        url,
        productId: product.id,
      }));

      // Create the new product images in the database
      await prisma.productImage.createMany({
        data: updatedImages,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    handleError(res, error, 'Failed to update product');
  }
});


// Add New Product with Images
router.post('/api/admin/products', async (req, res):Promise<void> => {
  let { name, description, price, stock, categoryId, productImages } = req.body;

  price = parseFloat(price);
  stock = parseInt(stock);
  categoryId = parseInt(categoryId);

  // Ensure productImages is an array, handle empty or invalid cases
  if (productImages) {
      productImages = Array.isArray(productImages) ? productImages : [productImages];
  } else {
      productImages = [];
  }

  // TypeScript type for product images (string URLs)
  type ProductImage = { url: string };

  try {
      const product = await prisma.product.create({
          data: { 
              name, 
              description, 
              price, 
              stock, 
              categoryId,
              images: {
                  create: productImages.map((image: string): ProductImage => ({ url: image })) // Explicit type for `image`
              },
          },
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

// Get All Products
router.get('/api/admin/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true, // Include related product images
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
    // Find the product by ID to ensure it exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Toggle the isArchived status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        isArchived: !product.isArchived,
      },
    });

    res.status(200).json({ success: true, message: 'Product archived status updated', product: updatedProduct });
    return;
  } catch (error) {
    console.error('Error updating product archived status:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

export default router;
