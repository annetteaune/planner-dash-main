import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { requireAuthUserId } from './jwt';
import { CreateTodoSchema, UpdateTodoSchema } from './schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const authedUserId = requireAuthUserId(req);
      if (!authedUserId) return res.status(401).json({ error: 'Unauthorized' });

      const rows =
        await sql`select id, text, completed, due_at, priority from todos where user_id = ${authedUserId} order by created_at desc`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const authedUserId = requireAuthUserId(req);
      if (!authedUserId) return res.status(401).json({ error: 'Unauthorized' });

      // Validate request body with Zod
      const requestData = { ...req.body, user_id: authedUserId };
      const validationResult = CreateTodoSchema.safeParse(requestData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => {
          const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
          return `${path}${err.message}`;
        });
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }

      const { text, due_at, priority } = validationResult.data;
      const prio = priority ?? 0;
      const rows = await sql`
        insert into todos (user_id, text, due_at, priority)
        values (${authedUserId}, ${text}, ${due_at ?? null}, ${prio})
        returning id`;
      return res.status(201).json({ id: rows[0].id });
    }

    if (req.method === 'PATCH') {
      // Validate request body with Zod
      const validationResult = UpdateTodoSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => {
          const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
          return `${path}${err.message}`;
        });
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }

      const { id, completed, text, due_at, priority } = validationResult.data;

      // For a simpler approach, just update completed status for now
      // Can be expanded later for other fields
      if (completed !== undefined) {
        const rows = await sql`
          update todos 
          set completed = ${completed}, updated_at = now()
          where id = ${id}
          returning id, text, completed, due_at, priority
        `;

        if (rows.length === 0) {
          return res.status(404).json({ error: 'Todo not found' });
        }

        return res.status(200).json(rows[0]);
      }

      return res
        .status(400)
        .json({ error: 'At least one field to update is required' });
    }

    if (req.method === 'DELETE') {
      const authedUserId = requireAuthUserId(req);
      if (!authedUserId) return res.status(401).json({ error: 'Unauthorized' });

      // Delete all completed todos for the user
      const rows = await sql`
        delete from todos 
        where user_id = ${authedUserId} and completed = true
        returning id
      `;

      return res.status(200).json({
        message: 'Completed todos deleted successfully',
        count: rows.length,
      });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
