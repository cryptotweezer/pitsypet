import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const chatRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "pitsypet:chat",
});

// Reserved for the assessment history search route (FR3). The route that calls
// the parameterised `search_assessments` RPC is not wired to a UI yet; apply
// this limiter when it is built.
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
