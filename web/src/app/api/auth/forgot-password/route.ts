import { NextRequest } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, getClientIp, rateLimited } from '@/lib/rateLimit';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email || '').trim().toLowerCase();

  // Réponse générique dans tous les cas : on ne révèle jamais si l'email existe ou non.
  const genericResponse = () =>
    Response.json({ message: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.' });

  if (!email) return genericResponse();

  // Anti abus : empêche de bombarder la boîte mail d'un tiers ou de faire tourner
  // le service d'envoi en boucle depuis une même IP.
  const ip = getClientIp(req);
  const [ipOk, emailOk] = await Promise.all([
    checkRateLimit(`forgot:ip:${ip}`, 10, 60 * 60),
    checkRateLimit(`forgot:email:${email}`, 3, 60 * 60),
  ]);
  if (!ipOk || !emailOk) return genericResponse(); // même réponse : ne révèle pas le rate limit non plus

  const rows = await sql`SELECT id, email FROM users WHERE LOWER(email) = LOWER(${email})`;
  const user = rows[0];
  if (!user) return genericResponse();

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await sql`
    UPDATE users
    SET reset_token_hash = ${tokenHash}, reset_token_expires = ${expires.toISOString()}
    WHERE id = ${user.id}
  `;

  const origin = req.headers.get('origin') || new URL(req.url).origin;
  const resetUrl = `${origin}/reinitialiser-mot-de-passe?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    console.error('Échec envoi email de réinitialisation:', err);
    // On ne révèle pas l'échec d'envoi au client (évite de confirmer l'existence du compte
    // et de donner des informations sur la config email interne).
  }

  return genericResponse();
}
