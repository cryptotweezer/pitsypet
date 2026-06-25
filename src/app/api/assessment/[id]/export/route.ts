import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isMedicationActive } from "@/lib/medications";
import { exportRateLimiter } from "@/lib/rate-limit";
import { checkDailyCap } from "@/lib/cost-guard";
import { arcjetGuard } from "@/lib/arcjet";
import { generateVetSummary } from "@/lib/ai/vet-summary";
import type {
  ExportBlock,
  ExportMedication,
  ExportPayload,
  ExportPriority,
  ExportRecord,
  ExportSymptom,
} from "@/lib/export/types";

function ageLabel(years: number, months: number | null): string {
  if (years <= 0 && months) return `${months} months old`;
  return months ? `${years}yr ${months}mo` : `${years} years old`;
}

function parseSymptoms(raw: unknown): ExportSymptom[] {
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

function strArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.map(String) : [];
}

// POST /api/assessment/[id]/export — assemble the vet-facing record + AI summary.
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Arcjet shield + bot detection before any DB/AI work.
  const blocked = await arcjetGuard(request);
  if (blocked) return blocked;

  // This route calls Claude (the vet summary), so it is bounded like the other
  // AI routes: the global daily spend cap, then a per-user rate limit.
  if (await checkDailyCap()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable — please try again later." },
      { status: 503 },
    );
  }
  const { success } = await exportRateLimiter.limit(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests — please slow down." },
      { status: 429 },
    );
  }

  // RLS scopes this to the owner.
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("assessment_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!assessment || !assessment.risk_classification) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const [{ data: pet }, { data: profile }, { data: medRows }] =
    await Promise.all([
      supabase
        .from("pets")
        .select(
          "pet_name, species, breed, age_years, age_months, weight_kg, medical_conditions",
        )
        .eq("pet_id", assessment.pet_id)
        .maybeSingle(),
      supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
      supabase
        .from("medications")
        .select(
          "name, dosage, dosage_unit, quantity, frequency, prescribed_by, started_at, ended_at",
        )
        .eq("pet_id", assessment.pet_id)
        .is("deleted_at", null),
    ]);

  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const medications: ExportMedication[] = (medRows ?? [])
    .map((m) => ({
      name: m.name,
      dosage: [m.dosage, m.dosage_unit].filter(Boolean).join(" ") || null,
      quantity: m.quantity,
      frequency: m.frequency,
      prescribedBy: m.prescribed_by,
      startedAt: m.started_at,
      endedAt: m.ended_at,
      // Current vs finished is derived from the end date, not a stale flag.
      active: isMedicationActive(m.ended_at),
    }))
    // Current meds first, then finished ones (each newest-started first).
    .sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return (b.startedAt ?? "").localeCompare(a.startedAt ?? "");
    });

  const initial: ExportBlock = {
    label: "Initial assessment",
    date: assessment.created_at,
    risk: assessment.risk_classification,
    primaryConcern: assessment.primary_concern,
    clinicalReasoning: assessment.clinical_reasoning,
    aboutSymptoms: assessment.about_symptoms,
    recommendedAction: assessment.recommended_action,
    redFlags: strArray(assessment.red_flags),
    symptoms: parseSymptoms(assessment.extracted_symptoms),
  };

  // follow_ups is appended chronologically — keep that order for the timeline.
  const followUpRaw: unknown[] = Array.isArray(assessment.follow_ups)
    ? (assessment.follow_ups as unknown[])
    : [];
  const followUps: ExportBlock[] = followUpRaw
    .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
    .map((f) => ({
      label: "Follow-up",
      date: String(f.created_at ?? assessment.created_at),
      risk: f.risk_classification ? String(f.risk_classification) : null,
      primaryConcern: f.primary_concern ? String(f.primary_concern) : null,
      clinicalReasoning: f.clinical_reasoning
        ? String(f.clinical_reasoning)
        : null,
      aboutSymptoms: f.about_symptoms ? String(f.about_symptoms) : null,
      recommendedAction: f.recommended_action
        ? String(f.recommended_action)
        : null,
      redFlags: strArray(f.red_flags),
      symptoms: parseSymptoms(f.extracted_symptoms),
    }));

  // Deterministic priority from the case's highest stored risk across all blocks
  // (any High → Urgent, any Medium → Soon, else Routine). Never softened by AI.
  const risks = [initial, ...followUps].map((b) => b.risk);
  const priority: ExportPriority = risks.includes("High")
    ? "Urgent"
    : risks.includes("Medium")
      ? "Soon"
      : "Routine";

  const record: ExportRecord = {
    pet: {
      name: pet.pet_name,
      species: pet.species,
      breed: pet.breed,
      ageLabel: ageLabel(pet.age_years, pet.age_months),
      weightKg: pet.weight_kg,
      conditions: Array.isArray(pet.medical_conditions)
        ? pet.medical_conditions.filter((c): c is string => typeof c === "string")
        : [],
    },
    ownerName: profile?.name ?? null,
    medications,
    clinic: null,
    initial,
    followUps,
    generatedAt: new Date().toISOString(),
  };

  const summary = await generateVetSummary(record);

  const payload: ExportPayload = { priority, summary, record };
  return NextResponse.json(payload);
}
