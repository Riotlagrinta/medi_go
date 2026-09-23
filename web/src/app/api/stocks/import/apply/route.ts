import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

interface ApplyEntry {
  name: string;
  price: number;
  quantity: number;
  medication_id: number | null;
}

// Applique un import en masse en deux requêtes seulement (peu importe le
// nombre de lignes) via UNNEST, plutôt qu'une requête par ligne : un import
// de plusieurs centaines de médicaments ne doit pas risquer le timeout de la
// fonction serverless.
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (!['pharmacy_admin', 'super_admin'].includes(user.role)) return forbidden();

  const body = await req.json().catch(() => ({}));
  const pharmacyId = parseInt(body?.pharmacy_id, 10);
  const entries: ApplyEntry[] = Array.isArray(body?.entries) ? body.entries : [];

  if (!pharmacyId || entries.length === 0) {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  if (user.role === 'pharmacy_admin' && user.pharmacy_id !== pharmacyId) {
    return forbidden();
  }

  const clean = entries.filter(
    (e) => e && typeof e.name === 'string' && e.name.trim() && Number.isFinite(e.price) && Number.isFinite(e.quantity)
  );
  if (clean.length === 0) {
    return Response.json({ error: 'Aucune ligne valide.' }, { status: 400 });
  }

  // 1) Crée en une fois les médicaments qui n'existent pas encore (dédupliqués par nom).
  const missingNames = [...new Set(clean.filter((e) => !e.medication_id).map((e) => e.name.trim()))];
  const idByName = new Map<string, number>();
  let createdCount = 0;

  if (missingNames.length > 0) {
    // Revérifie côté DB : un autre import a pu créer entre-temps un médicament
    // proposé comme "nouveau" au moment de la prévisualisation.
    const alreadyExist = await sql`
      SELECT id, name FROM medications WHERE LOWER(name) = ANY(${missingNames.map((n) => n.toLowerCase())}::text[])
    `;
    for (const row of alreadyExist) idByName.set(String(row.name).toLowerCase(), row.id);

    const toCreate = missingNames.filter((n) => !idByName.has(n.toLowerCase()));
    if (toCreate.length > 0) {
      const createdRows = await sql`
        INSERT INTO medications (name, category)
        SELECT * FROM UNNEST(${toCreate}::text[], ${toCreate.map(() => 'Autre')}::text[])
        RETURNING id, name
      `;
      for (const row of createdRows) idByName.set(String(row.name).toLowerCase(), row.id);
      createdCount = createdRows.length;
    }
  }

  const resolvedIds = clean.map((e) => e.medication_id ?? idByName.get(e.name.trim().toLowerCase()) ?? null);
  const validIdx = resolvedIds.map((id, i) => (id ? i : -1)).filter((i) => i >= 0);

  if (validIdx.length === 0) {
    return Response.json({ error: 'Impossible de résoudre les médicaments.' }, { status: 500 });
  }

  const finalMedIds = validIdx.map((i) => resolvedIds[i] as number);
  const finalQuantities = validIdx.map((i) => Math.max(0, Math.round(clean[i].quantity)));
  const finalPrices = validIdx.map((i) => clean[i].price);

  // 2) Upsert en masse des lignes de stock, en une seule requête.
  await sql`
    INSERT INTO pharmacy_stocks (pharmacy_id, medication_id, quantity, price)
    SELECT ${pharmacyId}, x.medication_id, x.quantity, x.price
    FROM UNNEST(${finalMedIds}::int[], ${finalQuantities}::int[], ${finalPrices}::numeric[])
      AS x(medication_id, quantity, price)
    ON CONFLICT (pharmacy_id, medication_id)
    DO UPDATE SET quantity = EXCLUDED.quantity, price = EXCLUDED.price, updated_at = NOW()
  `;

  return Response.json({ updated: finalMedIds.length, medicationsCreated: createdCount });
}
