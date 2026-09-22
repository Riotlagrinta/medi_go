import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { makeToken } from '@/lib/server-auth';
import { checkRateLimit, getClientIp, rateLimited } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password;
  const full_name = (body.full_name || body.name || '').trim();
  const role = body.role || 'patient';

  // Anti création massive de comptes depuis une même IP.
  const ip = getClientIp(req);
  if (!(await checkRateLimit(`register:ip:${ip}`, 10, 60 * 60))) return rateLimited();

  if (!email) return Response.json({ error: 'Adresse email requise' }, { status: 400 });
  if (!password) return Response.json({ error: 'Mot de passe requis' }, { status: 400 });
  if (!full_name) return Response.json({ error: 'Nom complet requis' }, { status: 400 });

  const exists = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`;
  if (exists.length)
    return Response.json({ error: 'Email déjà utilisé' }, { status: 409 });

  const password_hash = await bcrypt.hash(password, 10);
  const safeRole = role === 'super_admin' ? 'patient' : role;

  const [user] = await sql`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES (${email}, ${password_hash}, ${full_name}, ${safeRole})
    RETURNING id, email, full_name, role, phone, address, medical_info, photo_url, pharmacy_id, created_at
  `;

  return Response.json({ token: makeToken(user as any), user }, { status: 201 });
}
