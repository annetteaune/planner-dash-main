import { z } from 'zod';

// Todo validation schemas
export const TodoSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  text: z.string().min(1).max(150).trim(),
  completed: z.boolean(),
  due_at: z.string().datetime().nullable().optional(),
  priority: z.number().int().min(0).max(5).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

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

// Type exports
export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
