"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// App Router global error boundary — catches errors in the root layout/render
// that the per-route error.tsx can't, and reports them to Sentry. Dynamic so it
// receives the middleware's per-request CSP nonce (strict-dynamic would block a
// static page's scripts, and this page needs JS to report the error).
export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. Please refresh the page or try again.
        </p>
      </body>
    </html>
  );
}
