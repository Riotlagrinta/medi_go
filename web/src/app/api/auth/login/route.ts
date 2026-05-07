import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { makeToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password)
    return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 });

  const rows = await sql`
    SELECT u.*, p.name AS pharmacy_name
    FROM users u
    LEFT JOIN pharmacies p ON p.id = u.pharmacy_id
    WHERE u.email = ${email}
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
