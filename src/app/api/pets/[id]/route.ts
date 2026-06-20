import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { petApiSchema } from "@/lib/validations/pet";

// PATCH = update fields. DELETE = soft delete (deleted_at = now()). RLS scopes
// every row to the owner; we also pin user_id explicitly as defence in depth.

export async function PATCH(
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

  const parsed = petApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: pet, error } = await supabase
    .from("pets")
    .update(parsed.data)
    .eq("pet_id", params.id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "A pet with this name already exists. Please use a different name.",
        },
        { status: 409 },
      );
    }
    // No row matched (wrong owner / deleted / missing) → PostgREST returns an error.
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  return NextResponse.json({ pet });
}

export async function DELETE(
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
    .from("pets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("pet_id", params.id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
