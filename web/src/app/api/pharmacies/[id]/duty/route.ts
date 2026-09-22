import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

// Bascule manuelle du statut "de garde" d'une pharmacie.
// - Un pharmacy_admin ne peut modifier que sa propre pharmacie.
// - Un super_admin peut corriger le statut de n'importe quelle pharmacie.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const { is_on_duty } = await req.json();
  if (typeof is_on_duty !== 'boolean')
    return Response.json({ error: 'is_on_duty (booléen) requis' }, { status: 400 });

  const isOwnPharmacy = user.role === 'pharmacy_admin' && String(user.pharmacy_id) === String(id);
  const isSuperAdmin = user.role === 'super_admin';
  if (!isOwnPharmacy && !isSuperAdmin) return forbidden();

  const rows = await sql`
    UPDATE pharmacies
    SET is_on_duty = ${is_on_duty}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows[0]) return Response.json({ error: 'Pharmacie introuvable' }, { status: 404 });
  return Response.json(rows[0]);
}
