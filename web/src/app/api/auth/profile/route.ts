import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { full_name, phone, address, medical_info } = await req.json();

  const [updated] = await sql`
    UPDATE users
    SET full_name    = COALESCE(${full_name    ?? null}, full_name),
        phone        = COALESCE(${phone        ?? null}, phone),
        address      = COALESCE(${address      ?? null}, address),
        medical_info = COALESCE(${medical_info ?? null}, medical_info)
    WHERE id = ${user.id}
    RETURNING id, email, full_name, role, phone, address, medical_info, photo_url, pharmacy_id
  `;
  return Response.json(updated);
}
