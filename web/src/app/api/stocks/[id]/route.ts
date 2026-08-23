import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (!['pharmacy_admin', 'super_admin'].includes(user.role)) return forbidden();

  const { id } = await params;

  if (user.role === 'pharmacy_admin') {
    const rows = await sql`
      DELETE FROM pharmacy_stocks
      WHERE id = ${id} AND pharmacy_id = ${user.pharmacy_id}
      RETURNING *
    `;
    if (!rows[0]) return Response.json({ error: 'Stock introuvable ou accès non autorisé' }, { status: 404 });
    return Response.json({ success: true, deleted: rows[0] });
  }

  const rows = await sql`
    DELETE FROM pharmacy_stocks
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows[0]) return Response.json({ error: 'Stock introuvable' }, { status: 404 });
  return Response.json({ success: true, deleted: rows[0] });
}
