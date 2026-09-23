import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getUser, unauthorized, forbidden } from '@/lib/server-auth';

// Mise à jour rapide d'une ligne de stock existante, sans repasser par le
// formulaire complet : soit un ajustement relatif (`delta`, pour les boutons
// +/-), soit une valeur absolue (`quantity`, pour l'édition en ligne sur la
// carte). La quantité ne descend jamais sous 0.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (!['pharmacy_admin', 'super_admin'].includes(user.role)) return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { delta, quantity } = body ?? {};

  if (typeof delta !== 'number' && typeof quantity !== 'number') {
    return Response.json({ error: "Fournir 'delta' ou 'quantity'." }, { status: 400 });
  }

  // Neon (@neondatabase/serverless) n'a pas de fragments SQL composables : on
  // écrit chaque combinaison en entier plutôt que d'assembler des morceaux.
  const isOwnerScoped = user.role === 'pharmacy_admin';
  const newValueExpr = typeof quantity === 'number' ? Math.round(quantity) : null;
  const deltaExpr = typeof delta === 'number' ? Math.round(delta) : null;

  const rows = newValueExpr !== null
    ? isOwnerScoped
      ? await sql`
          UPDATE pharmacy_stocks SET quantity = GREATEST(0, ${newValueExpr}), updated_at = NOW()
          WHERE id = ${id} AND pharmacy_id = ${user.pharmacy_id} RETURNING *
        `
      : await sql`
          UPDATE pharmacy_stocks SET quantity = GREATEST(0, ${newValueExpr}), updated_at = NOW()
          WHERE id = ${id} RETURNING *
        `
    : isOwnerScoped
      ? await sql`
          UPDATE pharmacy_stocks SET quantity = GREATEST(0, quantity + ${deltaExpr}), updated_at = NOW()
          WHERE id = ${id} AND pharmacy_id = ${user.pharmacy_id} RETURNING *
        `
      : await sql`
          UPDATE pharmacy_stocks SET quantity = GREATEST(0, quantity + ${deltaExpr}), updated_at = NOW()
          WHERE id = ${id} RETURNING *
        `;

  if (!rows[0]) return Response.json({ error: 'Stock introuvable ou accès non autorisé' }, { status: 404 });
  return Response.json(rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return unauthorized();
  if (!['pharmacy_admin', 'super_admin'].includes(user.role)) return forbidden();

  const { id } = await params;

  if (user.role === 'pharmacy_admin') {
    const rows = await sql`
      DELETE FROM pharmacy_stocks
      WHERE id = ${id} AND pharmacy_id = ${user.pharmacy_id}
      RETURNING *
    `;
    if (!rows[0]) return Response.json({ error: 'Stock introuvable ou accès non autorisé' }, { status: 404 });
    return Response.json({ success: true, deleted: rows[0] });
  }

  const rows = await sql`
    DELETE FROM pharmacy_stocks
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows[0]) return Response.json({ error: 'Stock introuvable' }, { status: 404 });
  return Response.json({ success: true, deleted: rows[0] });
}
