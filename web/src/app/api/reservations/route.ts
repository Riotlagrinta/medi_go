import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const rows = await sql`
    SELECT r.*,
           m.name          AS medication_name,
           p.name          AS pharmacy_name,
           p.address       AS pharmacy_address,
           ps.price
    FROM reservations r
    JOIN medications m      ON m.id  = r.medication_id
    JOIN pharmacies p       ON p.id  = r.pharmacy_id
    JOIN pharmacy_stocks ps ON ps.pharmacy_id = r.pharmacy_id AND ps.medication_id = r.medication_id
    WHERE r.user_id = ${user.id}
    ORDER BY r.created_at DESC
  `;
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { pharmacy_id, medication_id, quantity = 1 } = await req.json();
  if (!pharmacy_id || !medication_id)
    return Response.json({ error: 'pharmacy_id et medication_id requis' }, { status: 400 });

  const stock = await sql`
    SELECT quantity FROM pharmacy_stocks
    WHERE pharmacy_id = ${pharmacy_id} AND medication_id = ${medication_id}
  `;
  if (!stock[0] || (stock[0].quantity as number) < quantity)
    return Response.json({ error: 'Stock insuffisant' }, { status: 400 });

  const [res] = await sql`
    INSERT INTO reservations (user_id, pharmacy_id, medication_id, quantity)
    VALUES (${user.id}, ${pharmacy_id}, ${medication_id}, ${quantity})
    RETURNING *
  `;
  return Response.json(res, { status: 201 });
}
