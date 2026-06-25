import arcjet, { shield, detectBot, type ArcjetDecision } from "@arcjet/next";

/**
 * Arcjet hardening for the AI endpoints (the cost/abuse surface). Auth lives
 * client-side against Supabase (signUp/signInWithPassword) and never hits our
 * server, so Supabase owns auth abuse protection; these guards cover the routes
 * that spend money on Claude/OpenAI.
 *
 * - shield: inspects the request for common attack payloads (SQLi/XSS/…).
 * - detectBot (allow: []): blocks automated clients. These endpoints are only
 *   ever called by our own browser UI (fetch with a real browser UA), never by
 *   crawlers, so allowing zero bot categories is correct.
 *
 * Per-user rate limiting + the global daily cost cap stay on Upstash — Arcjet
 * is layered on top, not a replacement. Decisions fail OPEN (an Arcjet outage
 * allows the request): this hardens, it never becomes a new single point of
 * failure. LIVE (blocking) only in production; DRY_RUN in dev so local manual
 * testing is never blocked by a bot-detection false positive.
 */
const mode = process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN";

const aj = arcjet({
  key: process.env.ARCJET_KEY ?? "",
  rules: [shield({ mode }), detectBot({ mode, allow: [] })],
});

function denial(decision: ArcjetDecision): Response {
  const status = decision.reason.isRateLimit() ? 429 : 403;
  const error = decision.reason.isBot()
    ? "Automated requests are not allowed."
    : "Request blocked.";
  return Response.json({ error }, { status });
}

/**
 * Run Arcjet on an API request. Returns a Response to send back when the request
 * is denied, or null to continue. No-op (returns null) when ARCJET_KEY is unset.
 */
export async function arcjetGuard(req: Request): Promise<Response | null> {
  if (!process.env.ARCJET_KEY) return null;
  // @arcjet/next reads headers/IP from the request; our route handlers receive a
  // standard Request, which is structurally compatible.
  const decision = await aj.protect(req as Parameters<typeof aj.protect>[0]);
  return decision.isDenied() ? denial(decision) : null;
}
