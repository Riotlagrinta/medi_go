import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.phone, u.address,
           u.medical_info, u.photo_url, u.pharmacy_id, u.created_at,
           p.name AS pharmacy_name
    FROM users u
    LEFT JOIN pharmacies p ON p.id = u.pharmacy_id
    WHERE u.id = ${user.id}
  `;
  if (!rows[0]) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  return Response.json(rows[0]);
}
