import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

import { createClient } from "@/lib/supabase/server";

// Always run fresh — a cached health check is meaningless.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const redis = Redis.fromEnv();

async function checkDatabase(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("breeds").select("id").limit(1);
    return error ? error.message : null;
  } catch (e) {
    return e instanceof Error ? e.message : "unknown";
  }
}

async function checkRedis(): Promise<string | null> {
  try {
    await redis.ping();
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "unknown";
  }
}

// GET /api/health — lightweight uptime probe. Round-trips a trivial read to the
// database and a PING to Upstash Redis. Both also count as activity, which keeps
// the Supabase project from auto-pausing and the free Upstash database from
// being deleted for inactivity (that deletion once broke every AI route, since
// the rate limiter and cost guard run before each model call). Unauthenticated
// by design: the RLS policy filters the rows to none for an anonymous caller,
// but the query still executes, so a successful (even empty) response means the
// database is reachable. Point UptimeRobot here (every 12 hours: a shorter
// interval burns the Hobby plan's Active CPU quota). No secrets.
export async function GET() {
  const startedAt = Date.now();
  const [dbError, redisError] = await Promise.all([checkDatabase(), checkRedis()]);

  const body = {
    database: dbError ? "unreachable" : "reachable",
    redis: redisError ? "unreachable" : "reachable",
  };

  if (dbError || redisError) {
    return NextResponse.json(
      { status: "error", ...body, error: dbError ?? redisError },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "ok",
    ...body,
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}
