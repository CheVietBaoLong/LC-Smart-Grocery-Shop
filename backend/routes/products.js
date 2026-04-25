const { verifyToken, isStaff } = require('../middleware/auth');

const express = require('express');
const prisma = require('../prisma/client');

const router = express.Router();

// Get all products (with current price)
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        product_price: {
          where: {
            OR: [
              { end_date: null },
              { end_date: { gte: new Date() } }
            ]
          },
          orderBy: { start_date: 'desc' },
          take: 1
        },
        stock: true
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Search products by name or category
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: {
        product_price: {
          where: {
            OR: [
              { end_date: null },
              { end_date: { gte: new Date() } }
            ]
          },
          orderBy: { start_date: 'desc' },
          take: 1
        }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const products = await prisma.product.findMany({
      where: { category: { equals: category, mode: 'insensitive' } },
      include: {
        product_price: {
          where: {
            OR: [
              { end_date: null },
              { end_date: { gte: new Date() } }
            ]
          },
          orderBy: { start_date: 'desc' },
          take: 1
        }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching by category:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { product_id: parseInt(id) },
      include: {
        product_price: {
          where: {
            OR: [
              { end_date: null },
              { end_date: { gte: new Date() } }
            ]
          },
          orderBy: { start_date: 'desc' },
          take: 1
        },
        stock: {
          include: { warehouses: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// === STAFF ROUTES ===

// Add new product (staff only)
router.post('/', verifyToken, isStaff, async (req, res) => {
  try {
    const { name, category, description, type, size, brand, price } = req.body;

    // Get next product_id
    const lastProduct = await prisma.product.findFirst({
      orderBy: { product_id: 'desc' }
    });
    const nextProductId = (lastProduct?.product_id || 0) + 1;

    const product = await prisma.product.create({
      data: {
        product_id: nextProductId,
        name,
        category,
        description,
        type,
        size,
        brand
      }
    });

    // If price provided, create price record
    if (price) {
      const lastPrice = await prisma.product_price.findFirst({
        orderBy: { price_id: 'desc' }
      });
      const nextPriceId = (lastPrice?.price_id || 0) + 1;

      await prisma.product_price.create({
        data: {
          price_id: nextPriceId,
          product_id: product.product_id,
          sell_price: price,
          start_date: new Date()
        }
      });
    }

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (staff only)
router.put('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, type, size, brand } = req.body;

    const product = await prisma.product.update({
      where: { product_id: parseInt(id) },
      data: { name, category, description, type, size, brand }
    });

    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (staff only)
router.delete('/:id', verifyToken, isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { product_id: parseInt(id) }
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;