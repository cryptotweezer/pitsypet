import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const MAX_ASSESSMENTS_PER_DAY = 200; // adjust as needed

function dailyKey(): string {
  return `pitsypet:assessments:${new Date().toISOString().slice(0, 10)}`;
}

// A per-user rate limit does not bound total spend; this global daily cap does.
export async function checkDailyCap(): Promise<boolean> {
  const count = (await redis.get<number>(dailyKey())) ?? 0;
  return count >= MAX_ASSESSMENTS_PER_DAY;
}

export async function incrementDailyAssessmentCount(): Promise<void> {
  const key = dailyKey();
  await redis.incr(key);
  await redis.expire(key, 86400 * 2); // keep 2 days for debugging
}
