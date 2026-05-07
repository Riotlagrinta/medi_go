import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { id } = await params;

  const rows = await sql`
    SELECT pr.*, u.full_name, u.phone
    FROM prescriptions pr
    JOIN users u ON u.id = pr.user_id
    WHERE pr.pharmacy_id = ${id}
    ORDER BY pr.created_at DESC
  `;
  return Response.json(rows);
}
