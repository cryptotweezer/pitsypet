import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// POST = restore a soft-deleted pet (deleted_at = null). Reviving the same
// pet_id automatically reconnects its assessment history. RLS scopes the row
// to the owner; we also pin user_id explicitly as defence in depth.
//
// The partial unique index `idx_pets_user_name_active` allows only ONE active
// pet per (user_id, pet_name). If the owner already re-created an active pet
// with this name, reviving would create a duplicate → 23505 → a friendly 409.
export async function POST(
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

  const { data: pet, error } = await supabase
    .from("pets")
    .update({ deleted_at: null })
    .eq("pet_id", params.id)
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "You already have an active pet with this name. Rename or delete it before restoring this one.",
        },
        { status: 409 },
      );
    }
    // No row matched (wrong owner / not deleted / missing).
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  return NextResponse.json({ pet });
}
