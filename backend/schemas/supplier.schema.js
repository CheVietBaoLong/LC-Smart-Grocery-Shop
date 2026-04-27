const { z } = require('zod');

const createSupplierSchema = z.object({
  name:       z.string().min(1, 'Supplier name is required'),
  address_id: z.number().int().positive().optional(),
});

const updateSupplierSchema = z.object({
  name:       z.string().min(1).optional(),
  address_id: z.number().int().positive().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

const addSupplySchema = z.object({
  product_id:     z.number().int().positive('Product ID is required'),
  supplier_price: z.number().positive().optional(),
  start_date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

module.exports = { createSupplierSchema, updateSupplierSchema, addSupplySchema };