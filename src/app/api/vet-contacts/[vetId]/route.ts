import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { vetContactUpdateSchema } from "@/lib/validations/vet-contact";

// PATCH = edit an owner-level clinic.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { vetId: string } },
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

  const parsed = vetContactUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: vetContact, error } = await supabase
    .from("vet_contacts")
    .update(parsed.data)
    .eq("vet_contact_id", params.vetId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  return NextResponse.json({ vetContact });
}

// DELETE = permanently remove a clinic. Clinics are owner-level reference data
// with no "restore" UI, so a soft delete would only leave hidden rows forever.
// The schema cascades doctors (ON DELETE CASCADE) and nulls the clinic link on
// any appointments (ON DELETE SET NULL), so those survive without their clinic.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { vetId: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("vet_contacts")
    .delete()
    .eq("vet_contact_id", params.vetId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete clinic" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
