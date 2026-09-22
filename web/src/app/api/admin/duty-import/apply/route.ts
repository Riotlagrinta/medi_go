import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';
import { CITY_FALLBACK_COORDS } from '@/lib/dutyImportParser';

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

interface ApplyEntry {
  name: string;
  address: string;
  city: string;
  phone: string;
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (user.role !== 'super_admin') return forbidden();

  const { entries } = await req.json().catch(() => ({ entries: [] }));
  if (!Array.isArray(entries) || entries.length === 0)
    return Response.json({ error: 'Aucune entrée à appliquer' }, { status: 400 });

  const existing = await sql`SELECT id, name, phone FROM pharmacies`;
  const byPhone = new Map(existing.map((p: any) => [normalizePhone(p.phone || ''), p]));
  const byName = new Map(existing.map((p: any) => [p.name.trim().toLowerCase(), p]));

  const onDutyIds: number[] = [];
  let updated = 0;
  let created = 0;

  for (const raw of entries as ApplyEntry[]) {
    if (!raw?.name || !raw?.phone) continue;
    const phoneKey = normalizePhone(raw.phone);
    const nameKey = raw.name.trim().toLowerCase();
    const match = byPhone.get(phoneKey) || byName.get(nameKey);

    if (match) {
      await sql`UPDATE pharmacies SET is_on_duty = TRUE, updated_at = NOW() WHERE id = ${match.id}`;
      onDutyIds.push(match.id);
      updated++;
    } else {
      const coords = CITY_FALLBACK_COORDS[raw.city] || CITY_FALLBACK_COORDS['Lomé'];
      const [created_row] = await sql`
        INSERT INTO pharmacies (name, address, phone, lat, lng, is_on_duty, is_verified)
        VALUES (${raw.name}, ${raw.address || raw.city}, ${raw.phone}, ${coords.lat}, ${coords.lng}, TRUE, FALSE)
        RETURNING id
      `;
      onDutyIds.push(created_row.id);
      created++;
    }
  }

  // Toute pharmacie absente de cette liste redevient "non de garde" : cet import
  // fait référence pour la période en cours.
  const resetRows = onDutyIds.length
    ? await sql`UPDATE pharmacies SET is_on_duty = FALSE WHERE NOT (id = ANY(${onDutyIds}::int[])) AND is_on_duty = TRUE RETURNING id`
    : await sql`UPDATE pharmacies SET is_on_duty = FALSE WHERE is_on_duty = TRUE RETURNING id`;

  return Response.json({
    updated,
    created,
    resetToFalse: resetRows.length,
    totalOnDuty: onDutyIds.length,
  });
}
