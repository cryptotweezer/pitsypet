import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// POST — mark an assessment as saved to history (RLS verifies ownership).
export async function POST(
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

  const { error } = await supabase
    .from("assessments")
    .update({ user_saved: true })
    .eq("assessment_id", params.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
