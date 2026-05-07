import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'super_admin') return forbidden();

  const [users, pharmacies, orders, revenue] = await Promise.all([
    sql`SELECT COUNT(*) AS count FROM users`,
    sql`SELECT COUNT(*) AS count FROM pharmacies`,
    sql`SELECT COUNT(*) AS count FROM reservations WHERE status != 'cancelled'`,
    sql`SELECT COALESCE(SUM(ps.price * r.quantity), 0) AS total
        FROM reservations r
        JOIN pharmacy_stocks ps ON ps.pharmacy_id = r.pharmacy_id AND ps.medication_id = r.medication_id
        WHERE r.status != 'cancelled'`,
  ]);

  return Response.json({
    users:      Number(users[0].count),
    pharmacies: Number(pharmacies[0].count),
    orders:     Number(orders[0].count),
    revenue:    Number(revenue[0].total),
  });
}
