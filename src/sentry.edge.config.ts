import * as Sentry from "@sentry/nextjs";

// Edge runtime (middleware, edge routes) Sentry init. No-op without a DSN.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
