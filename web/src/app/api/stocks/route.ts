import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (!['pharmacy_admin', 'super_admin'].includes(user.role)) return forbidden();

  const { pharmacy_id, medication_id, quantity, price } = await req.json();

  if (!pharmacy_id || !medication_id || quantity === undefined || price === undefined) {
    return Response.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  // Vérifier les permissions
  if (user.role === 'pharmacy_admin' && user.pharmacy_id !== parseInt(pharmacy_id)) {
    return forbidden();
  }

  const [stock] = await sql`
    INSERT INTO pharmacy_stocks (pharmacy_id, medication_id, quantity, price)
    VALUES (${pharmacy_id}, ${medication_id}, ${quantity}, ${price})
    ON CONFLICT (pharmacy_id, medication_id)
    DO UPDATE SET quantity = ${quantity}, price = ${price}, updated_at = NOW()
    RETURNING *
  `;

  return Response.json(stock, { status: 201 });
}
