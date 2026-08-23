import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { pharmacy_id, content, is_from_pharmacy = false } = await req.json();
  if (!pharmacy_id || !content) {
    return Response.json({ error: 'pharmacy_id et content requis' }, { status: 400 });
  }

  const [msg] = await sql`
    INSERT INTO messages (user_id, pharmacy_id, content, is_from_pharmacy)
    VALUES (${user.id}, ${pharmacy_id}, ${content}, ${is_from_pharmacy})
    RETURNING *
  `;

  return Response.json(msg, { status: 201 });
}
