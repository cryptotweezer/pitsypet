import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { activeSymptomUpdateSchema } from "@/lib/validations/active-symptom";

// PATCH = update an active symptom (e.g. mark resolved or worsened, change
// severity). Moving to 'resolved' stamps resolved_at; reactivating clears it.
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string; symptomId: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = activeSymptomUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const update: Database["public"]["Tables"]["active_symptoms"]["Update"] = {
    ...parsed.data,
  };
  if (parsed.data.status === "resolved") {
    update.resolved_at = new Date().toISOString().slice(0, 10);
  } else if (parsed.data.status) {
    // Any non-resolved status (active / improving / worsened) is still ongoing.
    update.resolved_at = null;
  }

  const { data: symptom, error } = await supabase
    .from("active_symptoms")
    .update(update)
    .eq("symptom_id", params.symptomId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Symptom not found" }, { status: 404 });
  }

  return NextResponse.json({ symptom });
}

// DELETE = soft delete an active symptom.
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string; symptomId: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("active_symptoms")
    .update({ deleted_at: new Date().toISOString() })
    .eq("symptom_id", params.symptomId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete symptom" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
