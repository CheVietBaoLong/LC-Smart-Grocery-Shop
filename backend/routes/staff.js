const { verifyToken, isStaff } = require('../middleware/auth');

const express = require('express');
const prisma = require('../prisma/client');

const router = express.Router();

// ============ STOCK MANAGEMENT ============

// Get all stock (all warehouses)
router.get('/stock', async (req, res) => {
  try {
    const stock = await prisma.stock.findMany({
      include: {
        products: true,
        warehouses: true
      }
    });

    res.json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

// Get stock for a specific warehouse
router.get('/stock/warehouse/:warehouse_id', async (req, res) => {
  try {
    const { warehouse_id } = req.params;

    const stock = await prisma.stock.findMany({
      where: { warehouse_id: parseInt(warehouse_id) },
      include: {
        products: true
      }
    });

    res.json(stock);
  } catch (error) {
    console.error('Error fetching warehouse stock:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse stock' });
  }
});

// Get stock for a specific product (across all warehouses)
router.get('/stock/product/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;

    const stock = await prisma.stock.findMany({
      where: { product_id: parseInt(product_id) },
      include: {
        warehouses: true
      }
    });

    res.json(stock);
  } catch (error) {
    console.error('Error fetching product stock:', error);
    res.status(500).json({ error: 'Failed to fetch product stock' });
  }
});

// Add stock to a warehouse
router.post('/stock', verifyToken, isStaff, async (req, res) => {
  try {
    const { warehouse_id, product_id, quantity } = req.body;

    // Check if stock record already exists
    const existingStock = await prisma.stock.findUnique({
      where: {
        product_id_warehouse_id: {
          product_id: parseInt(product_id),
          warehouse_id: parseInt(warehouse_id)
        }
      }
    });

    if (existingStock) {
      // Update existing stock
      const updated = await prisma.stock.update({
        where: {
          product_id_warehouse_id: {
            product_id: parseInt(product_id),
            warehouse_id: parseInt(warehouse_id)
          }
        },
        data: {
          quantity: existingStock.quantity + quantity
        }
      });

      res.json({ message: 'Stock updated', stock: updated });
    } else {
      // Create new stock record
      const newStock = await prisma.stock.create({
        data: {
          warehouse_id: parseInt(warehouse_id),
          product_id: parseInt(product_id),
          quantity
        }
      });

      res.status(201).json({ message: 'Stock added', stock: newStock });
    }
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Update stock quantity
router.put('/stock/:warehouse_id/:product_id', verifyToken, isStaff, async (req, res) => {
  try {
    const { warehouse_id, product_id } = req.params;
    const { quantity } = req.body;

    const stock = await prisma.stock.update({
      where: {
        product_id_warehouse_id: {
          product_id: parseInt(product_id),
          warehouse_id: parseInt(warehouse_id)
        }
      },
      data: { quantity }
    });

    res.json({ message: 'Stock updated', stock });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Remove stock from warehouse
router.delete('/stock/:warehouse_id/:product_id', verifyToken, isStaff, async (req, res) => {
  try {
    const { warehouse_id, product_id } = req.params;

    await prisma.stock.delete({
      where: {
        product_id_warehouse_id: {
          product_id: parseInt(product_id),
          warehouse_id: parseInt(warehouse_id)
        }
      }
    });

    res.json({ message: 'Stock removed' });
  } catch (error) {
    console.error('Error removing stock:', error);
    res.status(500).json({ error: 'Failed to remove stock' });
  }
});

// ============ WAREHOUSES ============

// Get all warehouses
router.get('/warehouses', async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        address: true
      }
    });

    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// Get single warehouse with stock
router.get('/warehouses/:warehouse_id', async (req, res) => {
  try {
    const { warehouse_id } = req.params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { warehouse_id: parseInt(warehouse_id) },
      include: {
        address: true,
        stock: {
          include: { products: true }
        }
      }
    });

    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.json(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
});

module.exports = router;