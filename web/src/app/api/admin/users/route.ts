import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'super_admin') return forbidden();

  const q = new URL(req.url).searchParams.get('q') ?? '';
  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.pharmacy_id, u.created_at,
           p.name AS pharmacy_name
    FROM users u
    LEFT JOIN pharmacies p ON p.id = u.pharmacy_id
    WHERE u.full_name ILIKE ${'%' + q + '%'} OR u.email ILIKE ${'%' + q + '%'}
    ORDER BY u.created_at DESC
  `;
  return Response.json(rows);
}
