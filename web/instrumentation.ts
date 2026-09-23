import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Capture les erreurs levées pendant le rendu serveur (Server Components, Route
// Handlers) — no-op si Sentry n'a pas été initialisé (pas de DSN configuré).
export const onRequestError = Sentry.captureRequestError;
