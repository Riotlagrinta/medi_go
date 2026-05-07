'use server';

export async function uploadPrescriptionAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('Aucun fichier fourni');

    const { put } = await import('@vercel/blob');
    const ext = file.name.split('.').pop() ?? 'jpg';
    const filename = `prescriptions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, file, { access: 'public' });
    return { success: true, publicUrl: blob.url };
  } catch (error: any) {
    console.error('Upload Action Error:', error);
    return { success: false, error: error.message as string };
  }
}
