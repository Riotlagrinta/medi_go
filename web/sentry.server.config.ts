import * as Sentry from '@sentry/nextjs';

// Ne s'active que si SENTRY_DSN est configuré — reste un no-op silencieux sinon,
// pour ne rien casser avant qu'un compte Sentry soit branché.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
