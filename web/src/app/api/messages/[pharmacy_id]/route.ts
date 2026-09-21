import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ pharmacy_id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { pharmacy_id } = await params;

  const isPharmacyStaff =
    (user.role === 'pharmacy_admin' && String(user.pharmacy_id) === String(pharmacy_id)) ||
    user.role === 'super_admin';

  // Une pharmacie voit toutes les conversations reçues (tous patients confondus) ;
  // un patient ne voit que sa propre conversation avec cette pharmacie.
  const rows = isPharmacyStaff
    ? await sql`
        SELECT m.*, u.full_name AS patient_name, u.phone AS patient_phone
        FROM messages m
        JOIN users u ON u.id = m.user_id
        WHERE m.pharmacy_id = ${pharmacy_id}
        ORDER BY m.created_at ASC
        LIMIT 300
      `
    : await sql`
        SELECT * FROM messages
        WHERE pharmacy_id = ${pharmacy_id} AND user_id = ${user.id}
        ORDER BY created_at ASC
        LIMIT 100
      `;
  return Response.json(rows);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ pharmacy_id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { pharmacy_id } = await params;
  const { content, is_from_pharmacy = false, user_id } = await req.json();
  if (!content)
    return Response.json({ error: 'content requis' }, { status: 400 });

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
