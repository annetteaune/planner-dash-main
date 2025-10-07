import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { getBearerToken, verifyToken } from './jwt';
import bcrypt from 'bcrypt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { id, email } = req.query;

      if (id && typeof id === 'string') {
        // Get user by ID
        const rows = await sql`
          select id, name, email, created_at, updated_at 
          from users 
          where id = ${id}
        `;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(rows[0]);
      }

      if (email && typeof email === 'string') {
        // Get user by email
        const rows = await sql`
          select id, name, email, created_at, updated_at 
          from users 
          where email = ${email}
        `;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(rows[0]);
      }

      return res
        .status(400)
        .json({ error: 'id or email parameter is required' });
    }

    if (req.method === 'POST') {
      const { name, email, password, password_hash } = req.body || {};

      // Accept either 'password' (new) or 'password_hash' (legacy) for backwards compatibility
      const plainPassword = password || password_hash;

      if (!name || !email || !plainPassword) {
        return res
          .status(400)
          .json({ error: 'name, email, and password are required' });
      }

      try {
        // Hash the password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        const rows = await sql`
          insert into users (name, email, password_hash)
          values (${name}, ${email}, ${hashedPassword})
          returning id, name, email, created_at, updated_at
        `;
        return res.status(201).json(rows[0]);
      } catch (err: any) {
        if (err.code === '23505') {
          // Unique constraint violation
          return res.status(409).json({ error: 'Email already exists' });
        }
        throw err;
      }
    }

    if (req.method === 'PUT') {
      // Require JWT and that caller matches id (self-update)
      const token = getBearerToken(req);
      const payload = token ? verifyToken(token) : null;
      if (!payload?.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id, name, email, password, password_hash } = req.body || {};

      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      if (payload.sub !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Accept either 'password' (new) or 'password_hash' (legacy) for backwards compatibility
      const plainPassword = password || password_hash;

      if (
        name === undefined &&
        email === undefined &&
        plainPassword === undefined
      ) {
        return res
          .status(400)
          .json({ error: 'At least one field to update is required' });
      }

      try {
        // Hash password if provided
        let hashedPassword = null;
        if (plainPassword) {
          const saltRounds = 10;
          hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        }

        const rows = await sql`
          update users 
          set 
            name = coalesce(${name ?? null}, name),
            email = coalesce(${email ?? null}, email),
            password_hash = coalesce(${hashedPassword ?? null}, password_hash)
          where id = ${id}
          returning id, name, email, created_at, updated_at
        `;

        if (rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(rows[0]);
      } catch (err: any) {
        if (err.code === '23505') {
          // Unique constraint violation
          return res.status(409).json({ error: 'Email already exists' });
        }
        throw err;
      }
    }

    res.setHeader('Allow', 'GET, POST, PUT');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
