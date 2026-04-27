const { z } = require('zod');

const createWarehouseSchema = z.object({
  capacity:   z.number().int().positive().optional(),
  address_id: z.number().int().positive().optional(),
  street:     z.string().min(1).optional(),
  city:       z.string().min(1).optional(),
  state:      z.string().min(1).optional(),
  zip_code:   z.string().min(1).optional(),
  country:    z.string().min(1).optional(),
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