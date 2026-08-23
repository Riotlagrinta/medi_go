import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  if (user.role === 'pharmacy_admin' && user.pharmacy_id) {
    const rows = await sql`
      SELECT a.id, a.user_id, a.pharmacy_id, a.appointment_date, a.reason, a.status, a.created_at,
             p.name AS pharmacy_name, p.address AS pharmacy_address,
             u.full_name AS patient_name, u.phone AS patient_phone
      FROM appointments a
      JOIN pharmacies p ON p.id = a.pharmacy_id
      JOIN users u ON u.id = a.user_id
      WHERE a.pharmacy_id = ${user.pharmacy_id}
      ORDER BY a.appointment_date DESC
    `;
    return Response.json(rows);
  }

  if (user.role === 'super_admin') {
    const rows = await sql`
      SELECT a.id, a.user_id, a.pharmacy_id, a.appointment_date, a.reason, a.status, a.created_at,
             p.name AS pharmacy_name, p.address AS pharmacy_address,
             u.full_name AS patient_name, u.phone AS patient_phone
      FROM appointments a
      JOIN pharmacies p ON p.id = a.pharmacy_id
      JOIN users u ON u.id = a.user_id
      ORDER BY a.appointment_date DESC
    `;
    return Response.json(rows);
  }

  // Patient
  const rows = await sql`
    SELECT a.id, a.user_id, a.pharmacy_id, a.appointment_date, a.reason, a.status, a.created_at,
           p.name AS pharmacy_name, p.address AS pharmacy_address
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
