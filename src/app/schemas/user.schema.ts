import { z } from 'zod';

// User validation schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(150).trim(),
  email: z.string().email().trim(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(150).trim(),
  email: z.string().email().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(150).trim().optional(),
  email: z.string().email().trim().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
