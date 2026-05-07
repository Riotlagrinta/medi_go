import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const q      = searchParams.get('q') ?? '';
  const lat    = parseFloat(searchParams.get('lat')    ?? '6.1372');
  const lng    = parseFloat(searchParams.get('lng')    ?? '1.2255');
  const radius = parseFloat(searchParams.get('radius') ?? '10000');

  const rows = await sql`
    SELECT
      p.id            AS pharmacy_id,
      p.name          AS pharmacy_name,
      p.address,
      p.phone,
      p.is_on_duty,
      p.is_verified,
      p.lat,
      p.lng,
      m.id            AS medication_id,
      m.name          AS medication_name,
      ps.price,
      ps.quantity,
      ROUND(
        6371000 * acos(
          LEAST(1, cos(radians(${lat})) * cos(radians(p.lat)) *
          cos(radians(p.lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(p.lat)))
        )
      ) AS distance
    FROM pharmacy_stocks ps
    JOIN pharmacies p  ON p.id  = ps.pharmacy_id
    JOIN medications m ON m.id  = ps.medication_id
    WHERE ps.quantity > 0
      AND (${q} = '' OR m.name ILIKE ${'%' + q + '%'})
      AND 6371000 * acos(
            LEAST(1, cos(radians(${lat})) * cos(radians(p.lat)) *
            cos(radians(p.lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(p.lat)))
          ) <= ${radius}
    ORDER BY distance ASC
    LIMIT 50
  `;

  return Response.json(rows);
}
