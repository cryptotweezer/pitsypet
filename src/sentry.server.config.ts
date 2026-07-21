import * as Sentry from "@sentry/nextjs";

// Server-side (Node runtime) Sentry init. A missing DSN makes init a no-op, so
// this is safe in environments where Sentry isn't configured.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Performance tracing — sample 10% of transactions (tune for cost/volume).
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  // Don't spam Sentry while developing locally.
  enabled: process.env.NODE_ENV === "production",
});
