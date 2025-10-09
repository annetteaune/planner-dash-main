import { z } from 'zod';

// Authentication validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim(),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(150, 'Name must be 150 characters or less')
      .regex(
        /.*\S.*/,
        'Name must contain at least one non-whitespace character'
      )
      .trim(),
    email: z
      .string()
      .email('Please enter a valid email address')
      .regex(/^\S+@\S+\.\S+$/, 'Email cannot contain whitespace')
      .trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// JWT payload schema
export const JWTPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Type exports
export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
