import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { nextPetSlug } from "@/lib/pet-slug";
import {
  BASIC_LIMITS,
  getUserPlan,
  LIMIT_MESSAGES,
} from "@/lib/plan-limits";
import { petApiSchema } from "@/lib/validations/pet";

// All pet access goes through the cookie-scoped server client, so RLS already
// constrains every row to the authenticated user. We still pass user_id on
// insert and re-check auth here (defence in depth).

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: pets, error } = await supabase
    .from("pets")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load pets" }, { status: 500 });
  }
  return NextResponse.json({ pets });
}

export async function POST(request: NextRequest) {
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

  const parsed = petApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // PitsyBasic includes 1 pet profile. Existing extra pets are never touched —
  // only creating beyond the cap is blocked.
  if ((await getUserPlan(supabase, user.id)) !== "premium") {
    const { count } = await supabase
      .from("pets")
      .select("pet_id", { count: "exact", head: true })
      .is("deleted_at", null);
    if ((count ?? 0) >= BASIC_LIMITS.maxPets) {
      return NextResponse.json(
        { error: LIMIT_MESSAGES.pets, code: "plan_limit" },
        { status: 403 },
      );
    }
  }

  const slug = await nextPetSlug(supabase, user.id, parsed.data.pet_name);
  const { data: pet, error } = await supabase
    .from("pets")
    .insert({ ...parsed.data, user_id: user.id, slug })
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation on UNIQUE(user_id, pet_name)
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "A pet with this name already exists. Please use a different name.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Failed to create pet" }, { status: 500 });
  }

  return NextResponse.json({ pet }, { status: 201 });
}
