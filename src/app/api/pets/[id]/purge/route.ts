import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { PET_PHOTO_BUCKET } from "@/lib/pet-photo";

// DELETE = permanently remove a pet from the database. Restricted to pets that
// are ALREADY soft-deleted (deleted_at IS NOT NULL), so a permanent delete is
// always a deliberate second step from the "Recently deleted" list.
//
// The pets→assessments FK is ON DELETE CASCADE, so this also removes every
// assessment for the pet. RLS scopes the row to the owner; we pin user_id too.
export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("pets")
    .delete()
    .eq("pet_id", params.id)
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .select("pet_id, photo_path");

  if (error) {
    return NextResponse.json(
      { error: "Failed to permanently delete pet" },
      { status: 500 },
    );
  }
  // No row matched → not in the deleted state / wrong owner / missing.
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  // The profile photo lives in Storage, which no FK cascade reaches.
  const photoPath = data[0].photo_path;
  if (photoPath) {
    await supabase.storage.from(PET_PHOTO_BUCKET).remove([photoPath]);
  }

  return NextResponse.json({ ok: true });
}
