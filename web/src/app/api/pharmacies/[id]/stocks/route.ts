import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const q = new URL(req.url).searchParams.get('q') ?? '';

  const rows = await sql`
    SELECT ps.id AS stock_id, ps.pharmacy_id, ps.medication_id, ps.quantity, ps.price,
           m.name, m.category, m.description
    FROM pharmacy_stocks ps
    JOIN medications m ON m.id = ps.medication_id
    WHERE ps.pharmacy_id = ${id}
      AND (${q} = '' OR m.name ILIKE ${'%' + q + '%'})
    ORDER BY m.name ASC
  `;
  return Response.json(rows);
}
