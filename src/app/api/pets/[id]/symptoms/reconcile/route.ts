import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { reconcileActiveSymptoms } from "@/lib/active-symptoms";

// POST /api/pets/[id]/symptoms/reconcile — apply a batch of symptom changes the
// contextual AI chat proposed (add / improving / worsened / resolved), using the
// same canonicalised reconciliation as assessment completion. Owner-scoped.
const bodySchema = z.object({
  symptoms: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        severity: z
          .enum(["mild", "moderate", "severe", "unknown"])
          .optional(),
        status: z
          .enum(["present", "improving", "worsened", "resolved"])
          .optional(),
      }),
    )
    .min(1),
});

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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Confirm ownership through the cookie-scoped client (RLS) before writing.
  const { data: pet } = await supabase
    .from("pets")
    .select("pet_id")
    .eq("pet_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  try {
    await reconcileActiveSymptoms(
      supabase,
      pet.pet_id,
      user.id,
      parsed.data.symptoms,
      "chat",
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update symptoms" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
