import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn, petHref } from "@/lib/utils";
import {
  RiskBadge,
  type RiskLevel,
} from "@/components/assessment/results/risk-badge";
import { ClinicalReasoning } from "@/components/assessment/results/clinical-reasoning";
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

  const { data: pet } = await supabase
    .from("pets")
    .select("pet_name, age_years")
    .eq("pet_id", assessment.pet_id)
    .maybeSingle();

  // Low risk → first-aid for the extracted symptoms, age-appropriate.
  let firstAid: FirstAid[] = [];
  if (risk === "Low" && pet) {
    const names = symptomNames(assessment.extracted_symptoms);
    if (names.length > 0) {
      const band = ageRange(pet.age_years);
      const { data: rows } = await supabase
        .from("first_aid_recommendations")
        .select("symptom_name, recommendation_text, age_range")
        .in("symptom_name", names)
        .in("age_range", [band, "Any"]);
      // Prefer the age-specific row over the generic 'Any' for each symptom.
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
      firstAid = Array.from(bySymptom.values());
    }
  }

  // High risk → emergency contacts in the user's state, plus the national line.
  let emergencyContacts: EmergencyContact[] = [];
  if (risk === "High") {
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

  const recordHref = petHref(assessment.pet_id, pet?.pet_name ?? "pet");

  return (
    <section className="mx-auto grid max-w-2xl gap-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold">
          {pet?.pet_name ? `${pet.pet_name}'s results` : "Assessment results"}
        </h1>
        {fromHistory && (
          <DeleteButton
            assessmentId={assessment.assessment_id}
            returnHref={recordHref}
          />
        )}
      </div>

      <RiskBadge risk={risk} />

      <ClinicalReasoning
        primaryConcern={assessment.primary_concern}
        clinicalReasoning={assessment.clinical_reasoning}
        aboutSymptoms={assessment.about_symptoms}
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
