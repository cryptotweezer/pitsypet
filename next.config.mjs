/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Nonce-independent security headers applied to every response (incl. /api
    // and static assets the middleware matcher skips). The per-request CSP lives
    // in middleware because it needs a fresh nonce — see src/lib/security/csp.ts.
    return [
      {
        source: "/:path*",
        headers: [
          // HTTPS-only deploys (Vercel). 2 years, subdomains, preload-eligible.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // No camera/mic/geo/payment/usb usage — deny outright.
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  org: "tweezer",
  project: "javascript-nextjs",
  // Quiet build logs unless on CI; source-map upload only runs when
  // SENTRY_AUTH_TOKEN is set (optional — the app reports fine without it).
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
});
