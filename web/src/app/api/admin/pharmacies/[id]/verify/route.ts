import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'super_admin') return forbidden();

  const { id } = await params;
  const { is_verified } = await req.json();

  const rows = await sql`
    UPDATE pharmacies SET is_verified = ${is_verified} WHERE id = ${id} RETURNING *
  `;
  if (!rows[0]) return Response.json({ error: 'Pharmacie introuvable' }, { status: 404 });
  return Response.json(rows[0]);
}
