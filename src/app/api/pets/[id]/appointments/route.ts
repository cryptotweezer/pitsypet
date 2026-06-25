import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { appointmentSchema } from "@/lib/validations/appointment";

// POST /api/pets/[id]/appointments — add a future visit for a pet the user owns.
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

  const parsed = appointmentSchema.safeParse(body);
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

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      ...parsed.data,
      scheduled_at: new Date(parsed.data.scheduled_at).toISOString(),
      pet_id: pet.pet_id,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to add appointment" },
      { status: 500 },
    );
  }

  return NextResponse.json({ appointment }, { status: 201 });
}
