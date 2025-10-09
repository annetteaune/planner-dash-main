import { z } from 'zod';

// Event validation schemas
export const EventSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200).trim(),
  content: z.string().max(1000).trim().nullable(),
  address: z.string().max(500).trim().nullable(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  all_day: z.boolean(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

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

// Type exports
export type Event = z.infer<typeof EventSchema>;
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export type UpdateEvent = z.infer<typeof UpdateEventSchema>;
