import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { vetDoctorSchema } from "@/lib/validations/vet-doctor";

// POST /api/vet-contacts/[vetId]/doctors — add a doctor to a clinic the user owns.
export async function POST(
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

  const parsed = vetDoctorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Verify the clinic belongs to the user (RLS also enforces this) before writing.
  const { data: clinic } = await supabase
    .from("vet_contacts")
    .select("vet_contact_id")
    .eq("vet_contact_id", params.vetId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!clinic) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  const { data: doctor, error } = await supabase
    .from("vet_doctors")
    .insert({
      ...parsed.data,
      vet_contact_id: clinic.vet_contact_id,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to add doctor" }, { status: 500 });
  }

  return NextResponse.json({ doctor }, { status: 201 });
}
