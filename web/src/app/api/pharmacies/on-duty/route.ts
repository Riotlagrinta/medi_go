import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const rows = await sql`SELECT * FROM pharmacies WHERE is_on_duty = TRUE ORDER BY name`;
  return Response.json(rows);
}
