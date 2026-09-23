import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';
import { parseStockCsv } from '@/lib/stockImportParser';

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (!['pharmacy_admin', 'super_admin'].includes(user.role)) return forbidden();

  const { text } = await req.json().catch(() => ({}));
  if (!text || typeof text !== 'string') {
    return Response.json({ error: 'Texte manquant.' }, { status: 400 });
  }

  const { rows, unmatched } = parseStockCsv(text);
  if (rows.length === 0) {
    return Response.json({ entries: [], unmatched });
  }

  const existing = await sql`SELECT id, name FROM medications`;
  const byName = new Map<string, number>(existing.map((m: any) => [String(m.name).toLowerCase().trim(), m.id]));

  const entries = rows.map((r) => ({
    name: r.name,
    price: r.price,
    quantity: r.quantity,
    medication_id: byName.get(r.name.toLowerCase().trim()) ?? null,
    raw: r.raw,
  }));

  return Response.json({ entries, unmatched });
}
