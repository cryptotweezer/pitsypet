import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { vetContactSchema } from "@/lib/validations/vet-contact";

// POST /api/pets/[id]/vet-contacts — add a vet contact to a pet the user owns.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
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

  const parsed = vetContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: pet } = await supabase
    .from("pets")
    .select("pet_id")
    .eq("pet_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const { data: vetContact, error } = await supabase
    .from("vet_contacts")
    .insert({ ...parsed.data, pet_id: pet.pet_id, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to add vet contact" },
      { status: 500 },
    );
  }

  return NextResponse.json({ vetContact }, { status: 201 });
}
