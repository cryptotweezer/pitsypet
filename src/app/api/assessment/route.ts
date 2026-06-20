import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// POST — start a new assessment for a pet the user owns. Returns the new
// assessment_id. (The chat page also creates rows directly server-side; this
// route exists for client-initiated "start assessment" flows.)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { petId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.petId) {
    return NextResponse.json({ error: "Missing petId" }, { status: 400 });
  }

  // Verify ownership through RLS before creating the assessment.
  const { data: pet } = await supabase
    .from("pets")
    .select("pet_id")
    .eq("pet_id", body.petId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const { data: assessment, error } = await supabase
    .from("assessments")
    .insert({ pet_id: body.petId, user_id: user.id })
    .select("assessment_id")
    .single();
  if (error) {
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { assessmentId: assessment.assessment_id },
    { status: 201 },
  );
}
