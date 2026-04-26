const { z } = require('zod');

const addressSchema = z.object({
  country:  z.string().min(1, 'Country is required'),
  street:   z.string().min(1, 'Street is required'),
  city:     z.string().min(1, 'City is required'),
  state:    z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
});

const cardSchema = z.object({
  card_type:   z.enum(['VISA', 'DEBIT', 'CREDIT', 'AMEX', 'MASTERCARD']),
  card_number: z.number().positive('Card number is required'),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  cvv:         z.string().length(3, 'CVV must be 3 digits'),
  address_id:  z.number().int().positive().optional(),
});

module.exports = { addressSchema, cardSchema };