import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const chatRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "pitsypet:chat",
});

// Assessment history search (FR3). Applied in GET /api/search, which calls the
// parameterised `search_assessments` RPC behind the /history page.
export const searchRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "pitsypet:search",
});

// The vet PDF export calls Claude to write the summary, so it must be bounded
// like the other AI routes. Tighter window than chat — exports are deliberate,
// occasional actions, not a back-and-forth.
export const exportRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "pitsypet:export",
});

// Public landing contact form (POST /api/contact). Keyed by client IP, not a
// user id — the page is unauthenticated. Tight window to blunt spam bursts; a
// honeypot field in the route catches the rest.
export const contactRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "pitsypet:contact",
});
