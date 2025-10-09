import { z } from 'zod';

// Authentication validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim(),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(150, 'Name must be 150 characters or less')
    .regex(/.*\S.*/, 'Name must contain at least one non-whitespace character')
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
});

// Todo validation schemas
export const CreateTodoSchema = z.object({
  user_id: z.string().uuid(),
  text: z
    .string()
    .min(1, 'Todo text is required')
    .max(150, 'Todo must be 150 characters or less')
    .trim(),
  due_at: z.string().datetime().nullable().optional(),
  priority: z.number().int().min(0).max(5).optional(),
});

export const UpdateTodoSchema = z.object({
  id: z.string().uuid(),
  completed: z.boolean().optional(),
  text: z.string().min(1).max(150).trim().optional(),
  due_at: z.string().datetime().nullable().optional(),
  priority: z.number().int().min(0).max(5).optional(),
});

// Event validation schemas
export const CreateEventSchema = z
  .object({
    user_id: z.string().uuid(),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or less')
      .trim(),
    content: z
      .string()
      .max(1000, 'Content must be 1000 characters or less')
      .trim()
      .nullable()
      .optional(),
    address: z
      .string()
      .max(500, 'Address must be 500 characters or less')
      .trim()
      .nullable()
      .optional(),
    start_at: z.string().datetime('Invalid start date format'),
    end_at: z.string().datetime('Invalid end date format'),
    all_day: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.all_day) {
        const startDate = new Date(data.start_at);
        const endDate = new Date(data.end_at);
        return endDate > startDate;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['end_at'],
    }
  );

export const UpdateEventSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200).trim().optional(),
    content: z.string().max(1000).trim().nullable().optional(),
    address: z.string().max(500).trim().nullable().optional(),
    start_at: z.string().datetime().optional(),
    end_at: z.string().datetime().optional(),
    all_day: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.start_at && data.end_at && !data.all_day) {
        const startDate = new Date(data.start_at);
        const endDate = new Date(data.end_at);
        return endDate > startDate;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['end_at'],
    }
  );

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
export type CreateTodoRequest = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoRequest = z.infer<typeof UpdateTodoSchema>;
export type CreateEventRequest = z.infer<typeof CreateEventSchema>;
export type UpdateEventRequest = z.infer<typeof UpdateEventSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
