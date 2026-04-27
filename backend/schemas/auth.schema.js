const { z } = require('zod');

const registerCustomerSchema = z.object({
  first_name:  z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name:   z.string().min(1, 'Last name is required'),
  email:       z.string().email('Invalid email'),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
});

const registerStaffSchema = z.object({
  first_name:   z.string().min(1, 'First name is required'),
  middle_name:  z.string().optional(),
  last_name:    z.string().min(1, 'Last name is required'),
  email:        z.string().email('Invalid email'),
  password:     z.string().min(8, 'Password must be at least 8 characters'),
  job_title:    z.string().min(1, 'Job title is required'),
  salary:       z.number().nonnegative().optional(),
  warehouse_id: z.number().int().positive().optional(),
  address_id:   z.number().int().positive().optional(),
});

const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { registerCustomerSchema, registerStaffSchema, loginSchema };