const { z } = require('zod');

const createWarehouseSchema = z.object({
  capacity:   z.number().int().positive().optional(),
  address_id: z.number().int().positive().optional(),
});

const stockSchema = z.object({
  product_id: z.number().int().positive('Product ID is required'),
  quantity:   z.number().int().nonnegative('Quantity cannot be negative'),
});

const adjustStockSchema = z.object({
  product_id: z.number().int().positive('Product ID is required'),
  delta:      z.number().int('Delta must be an integer'),
});

module.exports = { createWarehouseSchema, stockSchema, adjustStockSchema };