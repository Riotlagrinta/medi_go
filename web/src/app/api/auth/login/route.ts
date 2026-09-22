import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { makeToken } from '@/lib/server-auth';
import { checkRateLimit, getClientIp, rateLimited } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password;

  if (!email || !password)
    return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 });

  // Anti brute-force : par IP (un attaquant qui teste beaucoup de comptes) et par
  // email (un compte ciblé spécifiquement, même depuis des IP différentes).
  const ip = getClientIp(req);
  const [ipOk, emailOk] = await Promise.all([
    checkRateLimit(`login:ip:${ip}`, 20, 15 * 60),
    checkRateLimit(`login:email:${email}`, 8, 15 * 60),
  ]);
  if (!ipOk || !emailOk) return rateLimited();

  const rows = await sql`
    SELECT u.*, p.name AS pharmacy_name
    FROM users u
    LEFT JOIN pharmacies p ON p.id = u.pharmacy_id
    WHERE LOWER(u.email) = LOWER(${email})
  `;
  const user = rows[0];
  if (!user)
    return Response.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid)
    return Response.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });

  const { password_hash, ...safeUser } = user;
  return Response.json({ token: makeToken(safeUser as any), user: safeUser });
}
