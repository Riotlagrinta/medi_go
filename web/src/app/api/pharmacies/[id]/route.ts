import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

// Fiche publique d'une pharmacie (déjà exposée en liste via /api/pharmacies).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM pharmacies WHERE id = ${id}`;
  if (!rows[0]) return Response.json({ error: 'Pharmacie introuvable' }, { status: 404 });
  return Response.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const isOwnPharmacy = user.role === 'pharmacy_admin' && String(user.pharmacy_id) === String(id);
  const isSuperAdmin = user.role === 'super_admin';
  if (!isOwnPharmacy && !isSuperAdmin) return forbidden();

  const { name, phone, address } = await req.json();

  const rows = await sql`
    UPDATE pharmacies
    SET name       = COALESCE(${name    ?? null}, name),
        phone      = COALESCE(${phone   ?? null}, phone),
        address    = COALESCE(${address ?? null}, address),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows[0]) return Response.json({ error: 'Pharmacie introuvable' }, { status: 404 });
  return Response.json(rows[0]);
}
