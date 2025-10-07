import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { signToken } from './jwt';
import bcrypt from 'bcrypt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      // Get user with password hash
      const rows = await sql`
        select id, name, email, password_hash, created_at, updated_at 
        from users 
        where email = ${email}
      `;

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = rows[0];

      // Use bcrypt to compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Return user data without password hash and a JWT
      const { password_hash, ...userWithoutPassword } = user;
      const token = signToken({
        sub: user.id,
        email: user.email,
        name: user.name,
      });
      return res.status(200).json({ user: userWithoutPassword, token });
    }

    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
