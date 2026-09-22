import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';
import { parseDutyRoster } from '@/lib/dutyImportParser';

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'super_admin') return forbidden();

  const { text } = await req.json().catch(() => ({ text: '' }));
  if (!text || typeof text !== 'string')
    return Response.json({ error: 'Texte de la liste requis' }, { status: 400 });

  const { entries, unmatched } = parseDutyRoster(text);

  const existing = await sql`SELECT id, name, phone FROM pharmacies`;
  const byPhone = new Map(existing.map((p: any) => [normalizePhone(p.phone || ''), p]));

  const enriched = entries.map((e) => {
    const match = byPhone.get(normalizePhone(e.phone));
    return {
      ...e,
      existingId: match ? match.id : null,
      existingName: match ? match.name : null,
    };
  });

  return Response.json({ entries: enriched, unmatched });
}
