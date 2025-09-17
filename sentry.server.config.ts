import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.SENTRY_RELEASE || "prod",
  environment: process.env.SENTRY_ENV || "production",
  tracesSampleRate: 0.1,
  debug: false,
});
