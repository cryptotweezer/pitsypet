import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/assessment/chat-interface";

export const metadata = { title: "Assessment · PitsyPet" };

// The [id] slug here identifies the PET — normally its URL slug (/assessment/max,
// same addressing as /pets/max), with a fallback to the pet UUID so older links
// keep working. We mint a fresh assessment id here but do NOT insert a row — an
// assessment is only written to the DB once it COMPLETES (the chat route's
// onFinish upserts it). That way abandoning or refreshing mid-chat leaves no
// orphan rows; only finalized assessments exist. (Sibling route [id]/results/
// keys off the assessment id; Next.js requires the same slug name at this path
// level, hence [id] rather than [petSlug].)
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AssessmentPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ followup?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const supabase = await createClient();

  const petQuery = supabase
    .from("pets")
    .select("pet_id, pet_name, slug, medical_conditions")
    .is("deleted_at", null);
  const { data: pet } = await (UUID_RE.test(params.id)
    ? petQuery.eq("pet_id", params.id)
    : petQuery.eq("slug", params.id)
  ).maybeSingle();
  if (!pet) {
    notFound();
  }

  // Surface the pet's known context in the sidebar (the AI already gets it).
  const conditions = Array.isArray(pet.medical_conditions)
    ? pet.medical_conditions.filter((c): c is string => typeof c === "string")
    : [];
  // "Currently on" = no end date or an end date that hasn't passed. We derive
  // this from ended_at rather than the stored `active` flag, which can go stale.
  const today = new Date().toISOString().slice(0, 10);
  const { data: medRows } = await supabase
    .from("medications")
    .select("name, dosage, dosage_unit, frequency")
    .eq("pet_id", pet.pet_id)
    .is("deleted_at", null)
    .or(`ended_at.is.null,ended_at.gte.${today}`)
    .order("created_at", { ascending: false });
  const medications = (medRows ?? []).map((m) => ({
    name: m.name,
    dosage: [m.dosage, m.dosage_unit].filter(Boolean).join(" ") || null,
    frequency: m.frequency,
  }));

  // Upcoming appointments only (never past ones) — shown in the sidebar so the
  // owner sees the AI knows a vet visit is already booked.
  const { data: apptRows } = await supabase
    .from("appointments")
    .select("title, scheduled_at")
    .eq("pet_id", pet.pet_id)
    .gte("scheduled_at", new Date().toISOString())
    .is("deleted_at", null)
    .order("scheduled_at", { ascending: true });
  const appointments = (apptRows ?? []).map((a) => ({
    title: a.title,
    scheduled_at: a.scheduled_at,
  }));

  // Pre-load the pet's currently tracked symptoms so they already show in the
  // "Symptoms noticed" panel and the AI can ask how each has changed. Tracker
  // statuses map into the conversation vocabulary (active → present).
  const { data: trackedRows } = await supabase
    .from("active_symptoms")
    .select("name, severity, status")
    .eq("pet_id", pet.pet_id)
    .in("status", ["active", "improving", "worsened"])
    .is("deleted_at", null)
    .order("detected_at", { ascending: false });
  const severityValues = ["mild", "moderate", "severe", "unknown"] as const;
  type Severity = (typeof severityValues)[number];
  const initialSymptoms = (trackedRows ?? []).map((s) => ({
    name: s.name,
    severity: (severityValues as readonly string[]).includes(s.severity ?? "")
      ? (s.severity as Severity)
      : ("unknown" as Severity),
    status: (s.status === "active" ? "present" : s.status) as
      | "present"
      | "improving"
      | "worsened"
      | "resolved",
  }));

  // Follow-up mode: continue an existing completed assessment. We reuse its id
  // so onFinish appends a dated section instead of creating a new row. RLS +
  // the pet_id match confirm ownership.
  let assessmentId = crypto.randomUUID();
  let isFollowUp = false;
  let greeting = `Hi! I'm here to help check on ${pet.pet_name}. What symptoms have you noticed?`;

  if (searchParams.followup) {
    const { data: original } = await supabase
      .from("assessments")
      .select("assessment_id, primary_concern")
      .eq("assessment_id", searchParams.followup)
      .eq("pet_id", pet.pet_id)
      .not("completed_at", "is", null)
      .is("deleted_at", null)
      .maybeSingle();
    if (original) {
      assessmentId = original.assessment_id;
      isFollowUp = true;
      greeting = original.primary_concern
        ? `Let's follow up on ${pet.pet_name}'s previous assessment (${original.primary_concern}). How have they been since then?`
        : `Let's follow up on ${pet.pet_name}'s previous assessment. How have they been since then?`;
    }
  }

  // If symptoms are already being tracked, surface them up front so the owner
  // sees the AI is aware and can report how each has changed.
  if (initialSymptoms.length > 0) {
    const names = initialSymptoms.map((s) => s.name).join(", ");
    greeting += ` I'm already tracking these for ${pet.pet_name}: ${names}. How are they now: better, worse, or gone? And is there anything new?`;
  }

  return (
    <ChatInterface
      petId={pet.pet_id}
      petSlug={pet.slug}
      assessmentId={assessmentId}
      petName={pet.pet_name}
      isFollowUp={isFollowUp}
      greeting={greeting}
      conditions={conditions}
      medications={medications}
      appointments={appointments}
      initialSymptoms={initialSymptoms}
    />
  );
}
