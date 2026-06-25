/**
 * Content-Security-Policy builder (nonce-based).
 *
 * Next.js App Router emits a few inline bootstrap/hydration <script> tags. The
 * only XSS-safe way to allow those without `'unsafe-inline'` is a per-request
 * nonce: middleware generates it, sets it on the *request* `Content-Security-Policy`
 * header (Next reads it and stamps the nonce onto its own scripts) AND on the
 * *response* CSP header. `'strict-dynamic'` then lets those trusted scripts load
 * their dependencies while still blocking attacker-injected <script>s.
 *
 * The only browser-facing third party right now is Supabase (auth REST + realtime
 * websocket). Sentry/PostHog are server/Phase-11 and intentionally NOT whitelisted
 * here yet — add their ingest origins to `connect-src` when they are wired up.
 *
 * `style-src` keeps `'unsafe-inline'`: Base UI (shadcn base-nova) writes inline
 * `style` attributes for floating-element positioning (popovers, dialogs, tooltips),
 * which a nonce cannot cover. Inline-style injection is a far weaker vector than
 * script injection, so this is the standard, accepted relaxation.
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  // Supabase realtime uses a websocket on the same host.
  const supabaseWs = supabaseUrl.replace(/^https:\/\//, "wss://");
  const connectSrc = ["'self'", supabaseUrl, supabaseWs].filter(Boolean);

  // In dev, Next's HMR/React-Refresh relies on eval and inline scripts, so we
  // relax script-src. Production gets the strict nonce + strict-dynamic policy.
  const scriptSrc = isDev
    ? ["'self'", "'unsafe-eval'", "'unsafe-inline'"]
    : ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"];

  const directives: Record<string, string[] | true> = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": connectSrc,
    "worker-src": ["'self'", "blob:"],
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "manifest-src": ["'self'"],
  };

  // Force any stray http:// subresource onto https in production.
  if (!isDev) directives["upgrade-insecure-requests"] = true;

  return Object.entries(directives)
    .map(([key, value]) =>
      value === true ? key : `${key} ${(value as string[]).join(" ")}`,
    )
    .join("; ");
}

// Note: the nonce-independent security headers (HSTS, X-Frame-Options,
// X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are set as a
// static literal in `next.config.mjs` so they cover every response — including
// /api and _next/static assets that the middleware matcher skips. The CSP is
// set in middleware because it needs the per-request nonce.
