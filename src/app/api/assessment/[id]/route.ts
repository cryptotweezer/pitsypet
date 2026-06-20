import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// GET — fetch a single assessment (RLS verifies ownership).
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("assessment_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ assessment });
}
