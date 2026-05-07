import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const q   = searchParams.get('q')   ?? '';
  const lat = parseFloat(searchParams.get('lat') ?? '6.1372');
  const lng = parseFloat(searchParams.get('lng') ?? '1.2255');

  const rows = await sql`
    SELECT *,
      ROUND(
        6371000 * acos(
          LEAST(1, cos(radians(${lat})) * cos(radians(lat)) *
          cos(radians(lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(lat)))
        )
      ) AS distance
    FROM pharmacies
    WHERE name ILIKE ${'%' + q + '%'}
    ORDER BY distance ASC
    LIMIT 20
  `;
  return Response.json(rows);
}
