import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// DELETE = permanently remove a pet from the database. Restricted to pets that
// are ALREADY soft-deleted (deleted_at IS NOT NULL), so a permanent delete is
// always a deliberate second step from the "Recently deleted" list.
//
// The pets→assessments FK is ON DELETE CASCADE, so this also removes every
// assessment for the pet. RLS scopes the row to the owner; we pin user_id too.
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

  const { data, error } = await supabase
    .from("pets")
    .delete()
    .eq("pet_id", params.id)
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .select("pet_id");

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

  return NextResponse.json({ ok: true });
}
