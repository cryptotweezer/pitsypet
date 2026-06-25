import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { medicationSchema } from "@/lib/validations/medication";

// POST /api/pets/[id]/medications — add a medication to a pet the user owns.
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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

  const parsed = medicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Verify pet ownership through the cookie-scoped client (RLS) before writing.
  const { data: pet } = await supabase
    .from("pets")
    .select("pet_id")
    .eq("pet_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const { data: medication, error } = await supabase
    .from("medications")
    .insert({ ...parsed.data, pet_id: pet.pet_id, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to add medication" },
      { status: 500 },
    );
  }

  return NextResponse.json({ medication }, { status: 201 });
}
