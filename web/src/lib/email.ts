import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY manquant');
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.RESEND_FROM_EMAIL || 'MediGo <onboarding@resend.dev>';

  await getResend().emails.send({
    from,
    to,
    subject: 'Réinitialisez votre mot de passe MediGo',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #059669;">MediGo</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
        <p style="margin: 32px 0;">
          <a href="${resetUrl}" style="background:#059669;color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:bold;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="color:#64748b;font-size:13px;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email : votre mot de passe restera inchangé.
        </p>
      </div>
    `,
  });
}
