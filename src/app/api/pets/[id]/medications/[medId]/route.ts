import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { medicationUpdateSchema } from "@/lib/validations/medication";

// PATCH = edit a medication (e.g. dose change, mark inactive).
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; medId: string } },
) {
  const supabase = createClient();
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

  const parsed = medicationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: medication, error } = await supabase
    .from("medications")
    .update(parsed.data)
    .eq("medication_id", params.medId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Medication not found" }, { status: 404 });
  }

  return NextResponse.json({ medication });
}

// DELETE = soft delete a medication.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; medId: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("medications")
    .update({ deleted_at: new Date().toISOString() })
    .eq("medication_id", params.medId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete medication" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
