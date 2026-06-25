import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { vetDoctorUpdateSchema } from "@/lib/validations/vet-doctor";

// PATCH = edit a doctor.
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ vetId: string; doctorId: string }> }
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

  const parsed = vetDoctorUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: doctor, error } = await supabase
    .from("vet_doctors")
    .update(parsed.data)
    .eq("doctor_id", params.doctorId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  return NextResponse.json({ doctor });
}

// DELETE = permanently remove a doctor. Like clinics, doctors are owner-level
// reference data with no restore UI, so this is a hard delete (their name is
// only referenced as free text on medications/appointments, never by FK).
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ vetId: string; doctorId: string }> }
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
    .from("vet_doctors")
    .delete()
    .eq("doctor_id", params.doctorId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
