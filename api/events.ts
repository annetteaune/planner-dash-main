import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { requireAuthUserId } from './jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { user_id, id, start_date, end_date } = req.query;

      if (id && typeof id === 'string') {
        // Get specific event by ID
        const rows = await sql`
          select id, user_id, title, content, address, start_at, end_at, all_day, created_at, updated_at
          from events 
          where id = ${id}
        `;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        return res.status(200).json(rows[0]);
      }

      if (user_id && typeof user_id === 'string') {
        const authedUserId = requireAuthUserId(req);
        if (!authedUserId)
          return res.status(401).json({ error: 'Unauthorized' });
        if (authedUserId !== user_id)
          return res.status(403).json({ error: 'Forbidden' });
        // Get events for a user, optionally filtered by date range
        let rows;

        if (
          start_date &&
          end_date &&
          typeof start_date === 'string' &&
          typeof end_date === 'string'
        ) {
          // Both start and end date provided
          rows = await sql`
            select id, user_id, title, content, address, start_at, end_at, all_day, created_at, updated_at
            from events 
            where user_id = ${user_id} 
              and start_at >= ${start_date}
              and start_at <= ${end_date}
            order by start_at asc
          `;
        } else if (start_date && typeof start_date === 'string') {
          // Only start date provided
          rows = await sql`
            select id, user_id, title, content, address, start_at, end_at, all_day, created_at, updated_at
            from events 
            where user_id = ${user_id} 
              and start_at >= ${start_date}
            order by start_at asc
          `;
        } else if (end_date && typeof end_date === 'string') {
          // Only end date provided
          rows = await sql`
            select id, user_id, title, content, address, start_at, end_at, all_day, created_at, updated_at
            from events 
            where user_id = ${user_id} 
              and start_at <= ${end_date}
            order by start_at asc
          `;
        } else {
          // No date filters
          rows = await sql`
            select id, user_id, title, content, address, start_at, end_at, all_day, created_at, updated_at
            from events 
            where user_id = ${user_id}
            order by start_at asc
          `;
        }

        return res.status(200).json(rows);
      }

      return res
        .status(400)
        .json({ error: 'user_id or id parameter is required' });
    }

    if (req.method === 'POST') {
      const authedUserId = requireAuthUserId(req);
      if (!authedUserId) return res.status(401).json({ error: 'Unauthorized' });
      const { user_id, title, content, address, start_at, end_at, all_day } =
        req.body || {};

      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }

      const rows = await sql`
        insert into events (user_id, title, content, address, start_at, end_at, all_day)
        values (${authedUserId}, ${title}, ${content || null}, ${
        address || null
      }, ${start_at || null}, ${end_at || null}, ${all_day || false})
        returning id, user_id, title, content, address, start_at, end_at, all_day, created_at, updated_at
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const authedUserId = requireAuthUserId(req);
      if (!authedUserId) return res.status(401).json({ error: 'Unauthorized' });
      const { id, title, content, address, start_at, end_at, all_day } =
        req.body || {};

      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      if (
        title === undefined &&
        content === undefined &&
        address === undefined &&
        start_at === undefined &&
        end_at === undefined &&
        all_day === undefined
      ) {
        return res
          .status(400)
          .json({ error: 'At least one field to update is required' });
      }

      // Ensure the event belongs to the user
      const ownerRows = await sql`
        select user_id from events where id = ${id}
      `;
      if (ownerRows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      if (ownerRows[0].user_id !== authedUserId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const rows = await sql`
        update events 
        set 
          title = coalesce(${title ?? null}, title),
          content = coalesce(${content ?? null}, content),
          address = coalesce(${address ?? null}, address),
          start_at = coalesce(${start_at ?? null}, start_at),
          end_at = coalesce(${end_at ?? null}, end_at),
          all_day = coalesce(${all_day ?? null}, all_day)
        where id = ${id}
        returning id, user_id, title, content, address, start_at, end_at, all_day, created_at, updated_at
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const authedUserId = requireAuthUserId(req);
      if (!authedUserId) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'id parameter is required' });
      }

      // Ensure the event belongs to the user
      const ownerRows = await sql`
        select user_id from events where id = ${id}
      `;
      if (ownerRows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      if (ownerRows[0].user_id !== authedUserId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const rows = await sql`
        delete from events 
        where id = ${id}
        returning id
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.status(200).json({ message: 'Event deleted successfully' });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
