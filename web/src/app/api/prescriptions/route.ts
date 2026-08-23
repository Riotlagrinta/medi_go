import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  if (user.role === 'pharmacy_admin' && user.pharmacy_id) {
    const rows = await sql`
      SELECT pr.*, u.full_name, u.phone
      FROM prescriptions pr
      JOIN users u ON u.id = pr.user_id
      WHERE pr.pharmacy_id = ${user.pharmacy_id}
      ORDER BY pr.created_at DESC
    `;
    return Response.json(rows);
  }

  if (user.role === 'super_admin') {
    const rows = await sql`
      SELECT pr.*, u.full_name, u.phone, p.name AS pharmacy_name
      FROM prescriptions pr
      JOIN users u ON u.id = pr.user_id
      JOIN pharmacies p ON p.id = pr.pharmacy_id
      ORDER BY pr.created_at DESC
    `;
    return Response.json(rows);
  }

  // Patient
  const rows = await sql`
    SELECT pr.*, p.name AS pharmacy_name, p.address AS pharmacy_address
    FROM prescriptions pr
    JOIN pharmacies p ON p.id = pr.pharmacy_id
    WHERE pr.user_id = ${user.id}
    ORDER BY pr.created_at DESC
  `;
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { pharmacy_id, image_url } = await req.json();
  if (!pharmacy_id || !image_url)
    return Response.json({ error: 'pharmacy_id et image_url requis' }, { status: 400 });

  const [pres] = await sql`
    INSERT INTO prescriptions (user_id, pharmacy_id, image_url)
    VALUES (${user.id}, ${pharmacy_id}, ${image_url})
    RETURNING *
  `;
  return Response.json(pres, { status: 201 });
}
