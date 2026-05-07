import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ pharmacy_id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { pharmacy_id } = await params;

  const rows = await sql`
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
  const { content, is_from_pharmacy = false } = await req.json();
  if (!content)
    return Response.json({ error: 'content requis' }, { status: 400 });

  const [msg] = await sql`
    INSERT INTO messages (user_id, pharmacy_id, content, is_from_pharmacy)
    VALUES (${user.id}, ${pharmacy_id}, ${content}, ${is_from_pharmacy})
    RETURNING *
  `;
  return Response.json(msg, { status: 201 });
}
