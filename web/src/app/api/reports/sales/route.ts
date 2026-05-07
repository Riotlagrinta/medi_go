import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (!['pharmacy_admin', 'super_admin'].includes(user.role)) return forbidden();

  const rows = await sql`
    SELECT
      COALESCE(SUM(ps.price * r.quantity), 0)  AS total_revenue,
      COUNT(r.id)                               AS transaction_count,
      NOW()                                     AS generated_at,
      COALESCE(
        json_agg(json_build_object(
          'date',   r.created_at,
          'item',   m.name,
          'amount', ps.price * r.quantity
        ) ORDER BY r.created_at DESC),
        '[]'
      ) AS transactions
    FROM reservations r
    JOIN pharmacy_stocks ps ON ps.pharmacy_id = r.pharmacy_id AND ps.medication_id = r.medication_id
    JOIN medications m ON m.id = r.medication_id
    WHERE r.pharmacy_id = ${user.pharmacy_id}
      AND r.status != 'cancelled'
      AND r.created_at >= CURRENT_DATE
  `;

  const row = rows[0];
  return Response.json({
    total_revenue:     Number(row.total_revenue),
    transaction_count: Number(row.transaction_count),
    generated_at:      row.generated_at,
    transactions:      row.transactions ?? [],
  });
}
