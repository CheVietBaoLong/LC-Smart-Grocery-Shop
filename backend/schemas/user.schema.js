const { z } = require('zod');

const updateUserSchema = z.object({
  first_name:  z.string().min(1).optional(),
  middle_name: z.string().optional(),
  last_name:   z.string().min(1).optional(),
  email:       z.string().email().optional(),
  password:    z.string().min(8).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

module.exports = { updateUserSchema };