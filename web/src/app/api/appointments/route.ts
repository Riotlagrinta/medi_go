import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const rows = await sql`
    SELECT a.*, p.name AS pharmacy_name, p.address AS pharmacy_address
    FROM appointments a
    JOIN pharmacies p ON p.id = a.pharmacy_id
    WHERE a.user_id = ${user.id}
    ORDER BY a.appointment_date DESC
  `;
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { pharmacy_id, appointment_date, reason } = await req.json();
  if (!pharmacy_id || !appointment_date)
    return Response.json({ error: 'pharmacy_id et appointment_date requis' }, { status: 400 });

  const [appt] = await sql`
    INSERT INTO appointments (user_id, pharmacy_id, appointment_date, reason)
    VALUES (${user.id}, ${pharmacy_id}, ${appointment_date}, ${reason ?? 'Consultation'})
    RETURNING *
  `;
  return Response.json(appt, { status: 201 });
}
