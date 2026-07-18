import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  BASIC_LIMITS,
  getUserPlan,
  triageSessionsThisMonth,
} from "@/lib/plan-limits";
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

  // PitsyBasic monthly triage cap — checked here so an over-limit user gets a
  // friendly upgrade screen instead of a chat that errors on the first message.
  // Follow-ups belong to an existing session and are never gated. The chat
  // route re-checks server-side (this page check is UX, not the enforcement).
  if (!isFollowUp) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && (await getUserPlan(supabase, user.id)) !== "premium") {
      const used = await triageSessionsThisMonth(supabase);
      if (used >= BASIC_LIMITS.triageSessionsPerMonth) {
        return (
          <section className="mx-auto grid w-full max-w-xl gap-6 px-4 py-16">
            <div className="rounded-[2.5rem] border border-outline-variant/20 bg-white p-8 text-center md:p-10">
              <Crown className="mx-auto size-10 text-brand" aria-hidden />
              <h1 className="mt-4 font-display text-2xl tracking-tight text-brand">
                You&apos;ve used this month&apos;s free triage sessions
              </h1>
              <p className="mt-3 text-sm font-light text-on-surface-variant">
                PitsyBasic includes {BASIC_LIMITS.triageSessionsPerMonth} AI
                triage sessions per month across all your pets, and
                you&apos;ve used them. Your allowance resets at the start of
                next month, or you can go Premium for unlimited sessions.
              </p>
              <p className="mt-3 text-sm font-semibold text-on-surface">
                If you think this is an emergency, don&apos;t wait for an
                assessment — call your vet or nearest emergency clinic now.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard/billing?checkout=1"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand/90"
                >
                  Go Premium
                </Link>
                <Link
                  href={`/pets/${pet.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-6 py-3 text-sm font-bold text-brand transition-all hover:bg-muted"
                >
                  Back to {pet.pet_name}&apos;s record
                </Link>
              </div>
            </div>
          </section>
        );
      }
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
