import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { pharmacy_id, content, is_from_pharmacy = false, user_id } = await req.json();
  if (!pharmacy_id || !content) {
    return Response.json({ error: 'pharmacy_id et content requis' }, { status: 400 });
  }

  const isPharmacyStaff =
    (user.role === 'pharmacy_admin' && String(user.pharmacy_id) === String(pharmacy_id)) ||
    user.role === 'super_admin';

  // Un patient envoie toujours en son propre nom. Une pharmacie ne peut répondre
  // qu'à un patient précis : le user_id du destinataire est obligatoire.
  let recipientUserId = user.id;
  let fromPharmacy = false;

  if (is_from_pharmacy) {
    if (!isPharmacyStaff) return forbidden();
    if (!user_id) {
      return Response.json({ error: 'user_id (destinataire) requis pour répondre en tant que pharmacie' }, { status: 400 });
    }
    recipientUserId = user_id;
    fromPharmacy = true;
  }

  const [msg] = await sql`
    INSERT INTO messages (user_id, pharmacy_id, content, is_from_pharmacy)
    VALUES (${recipientUserId}, ${pharmacy_id}, ${content}, ${fromPharmacy})
    RETURNING *
  `;

  return Response.json(msg, { status: 201 });
}
