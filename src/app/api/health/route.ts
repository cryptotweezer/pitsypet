import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Always run fresh — a cached health check is meaningless.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/health — lightweight uptime probe. Round-trips a trivial read to the
// database (which also keeps the Supabase project from auto-pausing after
// inactivity) and reports reachability. Unauthenticated by design: the RLS
// policy filters the rows to none for an anonymous caller, but the query still
// executes against the DB, so a successful (even empty) response means the
// database is reachable. Point UptimeRobot here (every 5 min). No secrets.
export async function GET() {
  const startedAt = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("breeds").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", database: "unreachable", error: error.message },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "reachable",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        error: e instanceof Error ? e.message : "unknown",
      },
      { status: 503 },
    );
  }
}
