import * as Sentry from "@sentry/nextjs";

// Client-side (browser) Sentry init. The DSN is public by design (it only allows
// sending events, not reading them). No-op without a DSN, and disabled in dev.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});

// Instrument App Router client-side navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
