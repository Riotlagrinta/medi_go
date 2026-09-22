import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const { full_name, phone, address, medical_info, email, password, current_password } = await req.json();

  let newEmail: string | null = null;
  let newPasswordHash: string | null = null;

  // Changer l'email ou le mot de passe exige de reconfirmer le mot de passe actuel —
  // sans ça, un jeton JWT volé suffirait à prendre le contrôle définitif du compte.
  if (email || password) {
    if (!current_password) {
      return Response.json(
        { error: 'Mot de passe actuel requis pour changer l’email ou le mot de passe' },
        { status: 400 }
      );
    }
    const rows = await sql`SELECT password_hash FROM users WHERE id = ${user.id}`;
    const valid = rows[0] && (await bcrypt.compare(current_password, rows[0].password_hash as string));
    if (!valid) return Response.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
  }

  if (email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await sql`
      SELECT id FROM users WHERE LOWER(email) = LOWER(${normalizedEmail}) AND id != ${user.id}
    `;
    if (exists.length) return Response.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
    newEmail = normalizedEmail;
  }

  if (password) {
    if (String(password).length < 6)
      return Response.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
    newPasswordHash = await bcrypt.hash(password, 10);
  }

  const [updated] = await sql`
    UPDATE users
    SET full_name     = COALESCE(${full_name    ?? null}, full_name),
        phone         = COALESCE(${phone        ?? null}, phone),
        address       = COALESCE(${address      ?? null}, address),
        medical_info  = COALESCE(${medical_info ?? null}, medical_info),
        email         = COALESCE(${newEmail}, email),
        password_hash = COALESCE(${newPasswordHash}, password_hash)
    WHERE id = ${user.id}
    RETURNING id, email, full_name, role, phone, address, medical_info, photo_url, pharmacy_id
  `;
  return Response.json(updated);
}
