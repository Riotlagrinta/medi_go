'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// Composant sans rendu visuel : initialise Sentry côté navigateur une seule fois.
// Reste totalement inactif si NEXT_PUBLIC_SENTRY_DSN n'est pas défini.
export default function SentryInit() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN || Sentry.isInitialized()) return;
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }, []);

  return null;
}
