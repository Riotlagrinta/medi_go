import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'super_admin') return forbidden();

  const q = new URL(req.url).searchParams.get('q') ?? '';
  const rows = await sql`
    SELECT * FROM pharmacies WHERE name ILIKE ${'%' + q + '%'} ORDER BY created_at DESC
  `;
  return Response.json(rows);
}
