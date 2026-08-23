import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const q = new URL(req.url).searchParams.get('q') ?? '';
  const rows = await sql`
    SELECT id, name, category, description
    FROM medications
    WHERE name ILIKE ${'%' + q + '%'}
    ORDER BY name ASC
  `;
  return Response.json(rows);
}
