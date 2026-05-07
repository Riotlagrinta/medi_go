import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'super_admin') return forbidden();

  const { id } = await params;
  const { role, pharmacy_id } = await req.json();
  const allowed = ['patient', 'pharmacy_admin', 'super_admin'];
  if (!allowed.includes(role))
    return Response.json({ error: 'Rôle invalide' }, { status: 400 });

  const rows = await sql`
    UPDATE users SET role = ${role}, pharmacy_id = ${pharmacy_id ?? null}
    WHERE id = ${id}
    RETURNING id, email, full_name, role, pharmacy_id
  `;
  if (!rows[0]) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  return Response.json(rows[0]);
}
