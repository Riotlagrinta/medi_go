import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { makeToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const { email, password, full_name, role = 'patient' } = await req.json();

  if (!email || !password || !full_name)
    return Response.json({ error: 'Champs requis manquants' }, { status: 400 });

  const exists = await sql`SELECT id FROM users WHERE email = ${email}`;
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
