import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { ServiceHour } from "@/lib/validations/vet-contact";
import {
  formatPet,
  formatMedications,
  formatActiveSymptoms,
  formatAppointments,
  formatPriorAssessments,
} from "./format";

// A write the assistant proposes. NOTHING is written when this is emitted — the
// client renders a confirm/cancel card and only POSTs to `endpoint` (a normal,
// validated, RLS-scoped REST route) when the owner confirms. `start_assessment`
// is a navigation action (href) rather than a write.
export type ProposedActionKind =
  | "create_pet"
  | "add_medication"
  | "add_appointment"
  | "cancel_appointment"
  | "add_vet_contact"
  | "add_doctor"
  | "update_symptoms"
  | "start_assessment";

export type ProposedAction = {
  id: string;
  kind: ProposedActionKind;
  petId: string;
  petName: string;
  summary: string;
  endpoint?: string;
  method?: "POST" | "DELETE";
  payload?: unknown;
  href?: string;
};

export type PetRow = {
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string;
  age_years: number;
  age_months: number | null;
  weight_kg: number;
  medical_conditions: unknown;
};

// Everything the assistant needs about one pet: a formatted text block for the
// prompt, plus this pet's appointments so a "cancel appointment" proposal can
// resolve which one. Vet clinics are owner-level now (see loadUserClinics).
export type PetDossier = {
  petId: string;
  petName: string;
  text: string;
  appointments: { id: string; title: string; scheduled_at: string }[];
};

// Owner-level vet clinics (shared across all pets), with their doctors, plus the
// clinic name→id map so an "add doctor to <clinic>" / appointment proposal can
// resolve the clinic without exposing raw ids to the model.
export type UserClinics = {
  clinics: { id: string; name: string; service_hours: ServiceHour[] }[];
  text: string;
};

type Supabase = SupabaseClient<Database>;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
// JS Date.getDay() is 0=Sun…6=Sat — map onto our Mon-first labels.
const JS_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function formatServiceHours(hours: ServiceHour[]): string {
  if (!hours || hours.length === 0) return "hours not specified";
  return DAY_LABELS.map((d) => {
    const h = hours.find((x) => x.day === d);
    return h ? `${d} ${h.open}-${h.close}` : null;
  })
    .filter(Boolean)
    .join(", ");
}

// Is a clinic open at a given appointment datetime? Parses the wall-clock
// day/time directly from the ISO-ish string (no Date() timezone drift) and
// compares against the structured opening hours. Returns null if it can't parse
// (caller then skips the check). When hours are empty, treats it as open so a
// clinic without hours is never blocked.
export function clinicOpenAt(
  scheduledAt: string,
  hours: ServiceHour[],
): { open: boolean; dayLabel: string; timeLabel: string } | null {
  const m = scheduledAt.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const jsDay = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    12,
    0,
    0,
  ).getDay();
  const dayLabel = JS_DAY_LABELS[jsDay];
  const timeLabel = `${hh}:${mm}`;
  if (!hours || hours.length === 0) return { open: true, dayLabel, timeLabel };
  const minutes = Number(hh) * 60 + Number(mm);
  const open = hours.some((h) => {
    if (h.day !== dayLabel) return false;
    const [oh, om] = h.open.split(":").map(Number);
    const [ch, cm] = h.close.split(":").map(Number);
    return minutes >= oh * 60 + om && minutes <= ch * 60 + cm;
  });
  return { open, dayLabel, timeLabel };
}

// Load the owner's vet clinics + doctors once (not per pet). RLS scopes to the
// authenticated user.
export async function loadUserClinics(supabase: Supabase): Promise<UserClinics> {
  const { data: vetRows } = await supabase
    .from("vet_contacts")
    .select("vet_contact_id, clinic_name, phone, address, service_hours")
    .is("deleted_at", null);

  const clinics = (vetRows ?? []).map((v) => ({
    id: v.vet_contact_id,
    name: v.clinic_name ?? "Unnamed clinic",
    service_hours: (Array.isArray(v.service_hours)
      ? v.service_hours
      : []) as unknown as ServiceHour[],
  }));

  let doctorsByClinic = new Map<string, string[]>();
  if (clinics.length > 0) {
    const { data: docRows } = await supabase
      .from("vet_doctors")
      .select("name, specialty, vet_contact_id")
      .in(
        "vet_contact_id",
        clinics.map((c) => c.id),
      )
      .is("deleted_at", null);
    doctorsByClinic = (docRows ?? []).reduce((map, d) => {
      const list = map.get(d.vet_contact_id) ?? [];
      list.push(d.specialty ? `${d.name} (${d.specialty})` : d.name);
      map.set(d.vet_contact_id, list);
      return map;
    }, new Map<string, string[]>());
  }

  const text =
    clinics.length === 0
      ? "No vet clinics on record."
      : clinics
          .map((c) => {
            const v = (vetRows ?? []).find((r) => r.vet_contact_id === c.id);
            const bits = [c.name];
            if (v?.phone) bits.push(`ph ${v.phone}`);
            if (v?.address) bits.push(v.address);
            const docs = doctorsByClinic.get(c.id) ?? [];
            const docLine = docs.length > 0 ? `; doctors: ${docs.join(", ")}` : "";
            const hoursLine = `; hours: ${formatServiceHours(c.service_hours)}`;
            return `- ${bits.join(", ")}${hoursLine}${docLine}`;
          })
          .join("\n");

  return { clinics, text };
}

function asConditions(raw: unknown): string[] {
  return Array.isArray(raw)
    ? raw.filter((c): c is string => typeof c === "string")
    : [];
}

function extractNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) =>
      s && typeof s === "object" && "name" in s
        ? String((s as { name: unknown }).name)
        : null,
    )
    .filter((n): n is string => !!n);
}

// Load and format the full clinical picture for one pet.
export async function loadPetDossier(
  supabase: Supabase,
  pet: PetRow,
): Promise<PetDossier> {
  const today = new Date().toISOString().slice(0, 10);
  const [
    { data: medRows },
    { data: symptomRows },
    { data: apptRows },
    { data: priorRows },
  ] = await Promise.all([
    supabase
      .from("medications")
      .select("name, dosage, dosage_unit, frequency, started_at, ended_at, active")
      .eq("pet_id", pet.pet_id)
      .is("deleted_at", null)
      .or(`ended_at.is.null,ended_at.gte.${today}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("active_symptoms")
      .select("name, severity, status, detected_at")
      .eq("pet_id", pet.pet_id)
      .in("status", ["active", "improving", "worsened"])
      .is("deleted_at", null)
      .order("detected_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("appointment_id, title, scheduled_at, reason, notes, outcome")
      .eq("pet_id", pet.pet_id)
      .is("deleted_at", null)
      .order("scheduled_at", { ascending: false })
      .limit(10),
    supabase
      .from("assessments")
      .select(
        "created_at, risk_classification, primary_concern, recommended_action, extracted_symptoms",
      )
      .eq("pet_id", pet.pet_id)
      .not("completed_at", "is", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const sections = [
    formatPet({
      pet_name: pet.pet_name,
      species: pet.species,
      breed: pet.breed,
      age_years: pet.age_years,
      age_months: pet.age_months,
      weight_kg: pet.weight_kg,
      medical_conditions: asConditions(pet.medical_conditions),
    }),
    `Active symptoms:\n${formatActiveSymptoms(
      (symptomRows ?? []).map((s) => ({
        name: s.name,
        severity: s.severity,
        status: s.status,
        detected_at: s.detected_at,
      })),
    )}`,
    `Current medications:\n${formatMedications(
      (medRows ?? []).map((m) => ({
        name: m.name,
        dosage: m.dosage,
        dosage_unit: m.dosage_unit,
        frequency: m.frequency,
        started_at: m.started_at,
        ended_at: m.ended_at,
        active: m.active,
      })),
    )}`,
    `Appointments:\n${formatAppointments(
      (apptRows ?? []).map((a) => ({
        title: a.title,
        scheduled_at: a.scheduled_at,
        reason: a.reason,
        notes: a.notes,
        outcome: a.outcome,
      })),
    )}`,
    `Recent assessments:\n${formatPriorAssessments(
      (priorRows ?? []).map((a) => ({
        created_at: a.created_at,
        risk_classification: a.risk_classification,
        primary_concern: a.primary_concern,
        recommended_action: a.recommended_action,
        symptomNames: extractNames(a.extracted_symptoms),
      })),
    )}`,
  ];

  return {
    petId: pet.pet_id,
    petName: pet.pet_name,
    text: sections.join("\n\n"),
    appointments: (apptRows ?? []).map((a) => ({
      id: a.appointment_id,
      title: a.title,
      scheduled_at: a.scheduled_at,
    })),
  };
}
