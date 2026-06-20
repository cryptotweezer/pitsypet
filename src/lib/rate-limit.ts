import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const chatRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "pitsypet:chat",
});

export const searchRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "pitsypet:search",
});
