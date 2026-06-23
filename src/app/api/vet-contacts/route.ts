import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { vetContactSchema } from "@/lib/validations/vet-contact";
import { vetDoctorSchema } from "@/lib/validations/vet-doctor";

// Vet clinics are OWNER-level (shared across all the owner's pets), so these
// routes are not nested under a pet. RLS (auth.uid() = user_id) scopes every row.

// The assistant can add doctors together with a new clinic in one request.
const doctorsArraySchema = z.array(vetDoctorSchema).max(20).optional();

// GET /api/vet-contacts — list the owner's clinics.
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: vetContacts, error } = await supabase
    .from("vet_contacts")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load clinics" }, { status: 500 });
  }
  return NextResponse.json({ vetContacts });
}

// POST /api/vet-contacts — add a clinic (optionally with doctors).
export async function POST(request: NextRequest) {
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

  // Optional doctors to create alongside the clinic (assistant flow). Validated
  // separately so the manual form, which never sends them, is unaffected.
  const doctorsParsed = doctorsArraySchema.safeParse(
    (body as { doctors?: unknown }).doctors,
  );
  if (!doctorsParsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: doctorsParsed.error.flatten() },
      { status: 400 },
    );
  }
  const doctors = doctorsParsed.data ?? [];

  const { data: vetContact, error } = await supabase
    .from("vet_contacts")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to add clinic" },
      { status: 500 },
    );
  }

  // If doctors were provided, create them under the new clinic. A failure here
  // leaves the clinic saved (better than losing it) but reports partial success.
  if (doctors.length > 0) {
    const { error: docError } = await supabase.from("vet_doctors").insert(
      doctors.map((doc) => ({
        ...doc,
        vet_contact_id: vetContact.vet_contact_id,
        user_id: user.id,
      })),
    );
    if (docError) {
      return NextResponse.json(
        { vetContact, warning: "Clinic saved, but its doctors failed to save." },
        { status: 207 },
      );
    }
  }

  return NextResponse.json({ vetContact }, { status: 201 });
}
