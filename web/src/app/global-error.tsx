'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// Filet de sécurité pour les erreurs de rendu React non rattrapées (App Router).
// Reporte à Sentry si configuré, sinon se contente d'afficher un écran de secours.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    } else {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="fr">
      <body className="antialiased">
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>Une erreur est survenue</h1>
          <p style={{ color: '#64748b' }}>Merci de recharger la page. Si le problème persiste, contactez le support.</p>
        </div>
      </body>
    </html>
  );
}
