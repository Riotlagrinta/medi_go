import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  pharmacy_id: number | null;
}

export function makeToken(user: JWTPayload) {
  return jwt.sign(user, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as JWTPayload;
}

export function getUser(req: NextRequest): JWTPayload | null {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return verifyToken(header.slice(7));
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json({ error: 'Non authentifié' }, { status: 401 });
}

export function forbidden() {
  return Response.json({ error: 'Accès refusé' }, { status: 403 });
}
