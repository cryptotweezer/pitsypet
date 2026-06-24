import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn, petHref } from "@/lib/utils";
import {
  RiskBadge,
  type RiskLevel,
} from "@/components/assessment/results/risk-badge";
import {
  ClinicalReasoning,
  type SymptomItem,
} from "@/components/assessment/results/clinical-reasoning";
import {
  Recommendations,
  type FirstAid,
  type EmergencyContact,
} from "@/components/assessment/results/recommendations";
import { Disclaimer } from "@/components/assessment/results/disclaimer";
import { DeleteButton } from "@/components/assessment/results/delete-button";

export const metadata = { title: "Assessment results · PitsyPet" };

// Map a pet's age in years to a first-aid age band (Phase 6, task 6.4).
function ageRange(years: number): string {
  if (years < 1) return "Puppy (<1yr)";
  if (years < 2) return "Junior (1-2yr)";
  if (years <= 10) return "Adult (2-10yr)";
  return "Senior (>10yr)";
}

function symptomNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) =>
      s && typeof s === "object" && "name" in s
        ? String((s as { name: unknown }).name)
        : null,
    )
    .filter((n): n is string => !!n);
}

function parseSymptoms(raw: unknown): SymptomItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      name: String(s.name ?? ""),
      severity: s.severity ? String(s.severity) : undefined,
      onset: s.onset ? String(s.onset) : undefined,
      frequency: s.frequency ? String(s.frequency) : undefined,
      status: s.status ? String(s.status) : undefined,
    }))
    .filter((s) => s.name.length > 0);
}

type FollowUpSection = {
  created_at: string;
  risk_classification: RiskLevel | null;
  primary_concern: string | null;
  clinical_reasoning: string | null;
  recommended_action: string | null;
  about_symptoms: string | null;
  symptoms: SymptomItem[];
  red_flags: string[];
};

function parseFollowUps(raw: unknown): FollowUpSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      created_at: String(s.created_at ?? ""),
      risk_classification: (s.risk_classification ?? null) as RiskLevel | null,
      primary_concern: s.primary_concern ? String(s.primary_concern) : null,
      clinical_reasoning: s.clinical_reasoning
        ? String(s.clinical_reasoning)
        : null,
      recommended_action: s.recommended_action
        ? String(s.recommended_action)
        : null,
      about_symptoms: s.about_symptoms ? String(s.about_symptoms) : null,
      symptoms: parseSymptoms(s.extracted_symptoms),
      red_flags: Array.isArray(s.red_flags)
        ? (s.red_flags as unknown[]).map(String)
        : [],
    }));
}

function formatDateTime(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  // Delete is offered only when opening a past assessment from history, not on
  // the just-completed results view.
  const fromHistory = searchParams.from === "history";
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS scopes this to the owner; a non-owner gets no row.
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("assessment_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!assessment) notFound();

  // Not classified yet → send the owner back to finish the chat.
  if (!assessment.risk_classification) {
    redirect(`/assessment/${assessment.pet_id}`);
  }

  const risk = assessment.risk_classification as RiskLevel;
  const redFlags = Array.isArray(assessment.red_flags)
    ? (assessment.red_flags as unknown[]).map(String)
    : [];
  const symptoms = parseSymptoms(assessment.extracted_symptoms);
  // follow_ups is appended chronologically; show newest first so the timeline
  // reads most-recent → initial (the original block renders last, below).
  const followUps = parseFollowUps(assessment.follow_ups).reverse();

  const { data: pet } = await supabase
    .from("pets")
    .select("pet_name, age_years")
    .eq("pet_id", assessment.pet_id)
    .maybeSingle();

  // Age-appropriate first-aid lookup, reused for the initial assessment and any
  // Low-risk follow-up. Prefers the age-specific row over the generic 'Any'.
  const band = pet ? ageRange(pet.age_years) : null;
  async function loadFirstAid(names: string[]): Promise<FirstAid[]> {
    if (!band || names.length === 0) return [];
    const { data: rows } = await supabase
      .from("first_aid_recommendations")
      .select("symptom_name, recommendation_text, age_range")
      .in("symptom_name", names)
      .in("age_range", [band, "Any"]);
    const bySymptom = new Map<string, FirstAid>();
    for (const r of rows ?? []) {
      const existing = bySymptom.get(r.symptom_name);
      if (!existing || r.age_range !== "Any") {
        bySymptom.set(r.symptom_name, {
          symptom_name: r.symptom_name,
          recommendation_text: r.recommendation_text,
        });
      }
    }
    return Array.from(bySymptom.values());
  }

  // Low risk → first-aid for the extracted symptoms.
  const firstAid: FirstAid[] =
    risk === "Low" ? await loadFirstAid(symptomNames(assessment.extracted_symptoms)) : [];

  // High risk → emergency contacts in the user's state, plus the national line.
  // A follow-up is an immutable, separate snapshot, so the High case can live in
  // ANY block (a Low initial assessment followed by a High follow-up, say) — we
  // fetch the contacts once if the initial OR any follow-up is High.
  const needsEmergency =
    risk === "High" || followUps.some((f) => f.risk_classification === "High");
  let emergencyContacts: EmergencyContact[] = [];
  if (needsEmergency) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("state")
      .eq("id", user!.id)
      .maybeSingle();
    const states = profile?.state ? [profile.state, "ALL"] : ["ALL"];
    const { data: contacts } = await supabase
      .from("emergency_contacts")
      .select("contact_id, name, phone, address, is_24h, website, state")
      .in("state", states);
    // State-specific first, national hotline last.
    emergencyContacts = (contacts ?? [])
      .sort((a, b) => (a.state === "ALL" ? 1 : 0) - (b.state === "ALL" ? 1 : 0))
      .map((c) => ({
        contact_id: c.contact_id,
        name: c.name,
        phone: c.phone,
        address: c.address,
        is_24h: c.is_24h,
        website: c.website,
      }));
  }

  // Each follow-up renders its own risk-appropriate recommendations, so precompute
  // first-aid for the Low ones (emergency contacts are shared across blocks).
  const followUpData = await Promise.all(
    followUps.map(async (f) => ({
      ...f,
      firstAid:
        f.risk_classification === "Low"
          ? await loadFirstAid(f.symptoms.map((s) => s.name))
          : [],
    })),
  );

  const recordHref = petHref(assessment.pet_id, pet?.pet_name ?? "pet");

  return (
    <section className="mx-auto grid max-w-2xl gap-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">
          {pet?.pet_name ? `${pet.pet_name}'s results` : "Assessment results"}
        </h1>
        {fromHistory && (
          <div className="flex items-center gap-2">
            <Link
              href={`/assessment/${assessment.pet_id}?followup=${assessment.assessment_id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              + Follow-up
            </Link>
            <DeleteButton
              assessmentId={assessment.assessment_id}
              returnHref={recordHref}
            />
          </div>
        )}
      </div>

      {/* Follow-ups, newest first — the pet's most recent state leads. */}
      {followUps.length > 0 && (
        <div className="grid gap-4">
          <h2 className="font-heading text-lg font-semibold">
            Follow-ups ({followUps.length})
          </h2>
          {followUpData.map((f, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-xl border border-dashed p-4"
            >
              <span className="text-sm font-medium text-muted-foreground">
                Follow-up · {formatDateTime(f.created_at)}
              </span>
              {f.risk_classification && <RiskBadge risk={f.risk_classification} />}
              <ClinicalReasoning
                primaryConcern={f.primary_concern}
                clinicalReasoning={f.clinical_reasoning}
                aboutSymptoms={f.about_symptoms}
                symptoms={f.symptoms}
              />
              {f.risk_classification ? (
                <Recommendations
                  risk={f.risk_classification}
                  recommendedAction={f.recommended_action}
                  redFlags={f.red_flags}
                  firstAid={f.firstAid}
                  emergencyContacts={emergencyContacts}
                />
              ) : (
                f.recommended_action && (
                  <div className="grid gap-1 text-sm">
                    <p className="font-medium">Recommended next steps</p>
                    <p className="text-muted-foreground">
                      {f.recommended_action}
                    </p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* The original assessment renders last so the page reads newest → initial.
          Once there are follow-ups it's the historical starting point, so label it. */}
      {followUps.length > 0 && (
        <h2 className="font-heading text-lg font-semibold">
          Initial assessment · {formatDateTime(assessment.created_at)}
        </h2>
      )}

      <RiskBadge risk={risk} />

      <ClinicalReasoning
        primaryConcern={assessment.primary_concern}
        clinicalReasoning={assessment.clinical_reasoning}
        aboutSymptoms={assessment.about_symptoms}
        symptoms={symptoms}
      />

      <Recommendations
        risk={risk}
        recommendedAction={assessment.recommended_action}
        redFlags={redFlags}
        firstAid={firstAid}
        emergencyContacts={emergencyContacts}
      />

      <Disclaimer />

      <div className="flex flex-wrap items-center gap-2">
        <Link href={recordHref} className={cn(buttonVariants())}>
          ← Back to {pet?.pet_name ? `${pet.pet_name}'s` : "the"} record
        </Link>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Dashboard
        </Link>
      </div>
    </section>
  );
}
