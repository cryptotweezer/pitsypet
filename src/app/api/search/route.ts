import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { searchRateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/search?q=… — full-text search across the user's COMPLETED assessments
// (clinical reasoning + primary concern + symptoms, plus pet name). RLS scopes
// the RPC to auth.uid(); query_text is parameterised via plainto_tsquery, so it
// is injection-safe. Rate-limited at 30/min/user.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const { success } = await searchRateLimiter.limit(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many searches — please slow down." },
      { status: 429 },
    );
  }

  const { data, error } = await supabase.rpc("search_assessments", {
    query_text: q,
    match_count: 50,
  });
  if (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [] });
}
