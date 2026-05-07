import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { getUser, unauthorized } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return unauthorized();

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return Response.json({ error: 'Aucun fichier reçu' }, { status: 400 });

  if (!file.type.startsWith('image/'))
    return Response.json({ error: 'Seules les images sont acceptées' }, { status: 400 });

  if (file.size > 5 * 1024 * 1024)
    return Response.json({ error: 'Fichier trop volumineux (max 5 MB)' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `prescriptions/${user.id}-${Date.now()}.${ext}`;

  const blob = await put(filename, file, { access: 'public' });
  return Response.json({ url: blob.url });
}
