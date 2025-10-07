import type { VercelRequest } from '@vercel/node';
import {
  sign as jwtSign,
  verify as jwtVerify,
  type Secret,
  type SignOptions,
} from 'jsonwebtoken';

const DEFAULT_DEV_SECRET = 'dev-secret-change-me';

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;
  return secret;
}

export function signToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresInSeconds: number = 60 * 60 * 24 * 7
): string {
  const secret = getJwtSecret() as Secret;
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: expiresInSeconds,
  };
  return jwtSign(payload as object, secret, options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = getJwtSecret() as Secret;
    return jwtVerify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: VercelRequest): string | null {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization' as any];
  if (!authHeader || Array.isArray(authHeader)) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function requireAuthUserId(req: VercelRequest): string | null {
  const token = getBearerToken(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.sub) return null;
  return payload.sub;
}
