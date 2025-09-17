import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "prod",
  environment: process.env.NEXT_PUBLIC_SENTRY_ENV || "production",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Utilise un tunnel côté serveur pour contourner les blocages/adblock
  tunnel: "/api/monitoring",
  debug: false,
});
