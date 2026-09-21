import { NextRequest } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { makeToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}) as any);

  if (!token || !password)
    return Response.json({ error: 'Token et mot de passe requis' }, { status: 400 });
  if (password.length < 6)
    return Response.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const rows = await sql`
    SELECT u.*, p.name AS pharmacy_name
    FROM users u
    LEFT JOIN pharmacies p ON p.id = u.pharmacy_id
    WHERE u.reset_token_hash = ${tokenHash} AND u.reset_token_expires > NOW()
  `;
  const user = rows[0];
  if (!user)
    return Response.json({ error: 'Lien invalide ou expiré. Refaites une demande.' }, { status: 400 });

  const password_hash = await bcrypt.hash(password, 10);

  await sql`
    UPDATE users
    SET password_hash = ${password_hash}, reset_token_hash = NULL, reset_token_expires = NULL
    WHERE id = ${user.id}
  `;

  const { password_hash: _omit, reset_token_hash: _omit2, reset_token_expires: _omit3, ...safeUser } = user;
  return Response.json({ token: makeToken(safeUser as any), user: safeUser });
}
