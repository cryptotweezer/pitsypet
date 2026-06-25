import * as Sentry from "@sentry/nextjs";

// Next.js calls register() once per server runtime at startup. Load the matching
// Sentry config so server + edge errors are captured.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captures errors thrown in Server Components, route handlers, etc. (Next 15).
export const onRequestError = Sentry.captureRequestError;
