const { z } = require('zod');

const createProductSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  category:    z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  type:        z.string().optional(),
  size:        z.string().optional(),
  brand:       z.string().optional(),
});

const updateProductSchema = z.object({
  name:        z.string().min(1).optional(),
  category:    z.string().min(1).optional(),
  description: z.string().optional(),
  type:        z.string().optional(),
  size:        z.string().optional(),
  brand:       z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

const setPriceSchema = z.object({
  sell_price: z.number().positive('Price must be positive'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

module.exports = { createProductSchema, updateProductSchema, setPriceSchema };