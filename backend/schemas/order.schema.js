const { z } = require('zod');

const orderItemSchema = z.object({
  product_id: z.number().int().positive('Product ID is required'),
  quantity:   z.number().int().positive('Quantity must be at least 1'),
});

const createOrderSchema = z.object({
  card_id:     z.number().int().positive().optional(),
  delivery_id: z.number().int().positive().optional(),
  order_date:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  items:       z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  address_id:  z.number().int().positive().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return']),
});

module.exports = { createOrderSchema, updateStatusSchema };