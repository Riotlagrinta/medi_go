import { NextRequest } from 'next/server';
import sql from './db';

// Rate limiting "fenêtre fixe" adossé à Postgres (Neon) — pas de service tiers
// nécessaire. L'UPSERT est atomique (une seule requête), donc sûr même avec des
// requêtes concurrentes sur la même clé.
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const rows = await sql`
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (${key}, 1, NOW())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_start < NOW() - (${windowSeconds}::text || ' seconds')::interval THEN 1
        ELSE rate_limits.count + 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start < NOW() - (${windowSeconds}::text || ' seconds')::interval THEN NOW()
        ELSE rate_limits.window_start
      END
    RETURNING count
  `;
  const count = rows[0]?.count ?? 1;
  return count <= limit;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export function rateLimited() {
  return Response.json(
    { error: 'Trop de tentatives. Merci de réessayer dans quelques minutes.' },
    { status: 429 }
  );
}
