import { NextRequest } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') ?? '6.1372');
  const lng = parseFloat(searchParams.get('lng') ?? '1.2255');

  const rows = await sql`
    SELECT *,
      ROUND(
        6371000 * acos(
          LEAST(1, GREATEST(-1,
            cos(radians(${lat})) * cos(radians(lat)) *
            cos(radians(lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(lat))
          ))
        )
      ) AS distance
    FROM pharmacies 
    WHERE is_on_duty = TRUE 
    ORDER BY distance ASC, name ASC
  `;
  return Response.json(rows);
}
