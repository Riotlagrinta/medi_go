import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (!['pharmacy_admin', 'super_admin'].includes(user.role)) return forbidden();

  const { id } = await params;
  const { status } = await req.json();
  const allowed = ['pending', 'ready', 'rejected', 'picked_up'];
  if (!allowed.includes(status))
    return Response.json({ error: 'Statut invalide' }, { status: 400 });

  const rows = await sql`
    UPDATE prescriptions SET status = ${status}
    WHERE id = ${id} AND pharmacy_id = ${user.pharmacy_id}
    RETURNING *
  `;
  if (!rows[0]) return Response.json({ error: 'Ordonnance introuvable' }, { status: 404 });
  return Response.json(rows[0]);
}
