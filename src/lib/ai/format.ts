// Prompt-formatting helpers shared by the chat route and the classifier.

type Symptom = {
  name: string;
  onset?: string;
  frequency?: string;
  severity: string;
};

type Pet = {
  pet_name: string;
  species: string;
  breed: string;
  age_years: number;
  age_months?: number | null;
  weight_kg: number;
  medical_conditions: string[];
};

type Chunk = { text: string; source: string; body_system?: string | null };

type MedicationContext = {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  active?: boolean | null;
};

type PriorAssessment = {
  created_at: string;
  risk_classification?: string | null;
  primary_concern?: string | null;
  recommended_action?: string | null;
  symptomNames: string[];
};

type AppointmentContext = {
  title: string;
  scheduled_at: string;
  reason?: string | null;
  notes?: string | null;
  outcome?: string | null;
};

type ActiveSymptomContext = {
  name: string;
  severity?: string | null;
  status?: string | null;
  detected_at?: string | null;
};

export function formatSymptoms(symptoms: Symptom[]): string {
  if (symptoms.length === 0) return "No symptoms recorded yet.";
  return symptoms
    .map((s) => {
      const parts = [s.name];
      if (s.onset) parts.push(`onset: ${s.onset}`);
      if (s.frequency) parts.push(`frequency: ${s.frequency}`);
      if (s.severity !== "unknown") parts.push(`severity: ${s.severity}`);
      return "- " + parts.join(", ");
    })
    .join("\n");
}

export function formatPet(pet: Pet): string {
  const ageStr = pet.age_months
    ? `${pet.age_years}yr ${pet.age_months}mo`
    : `${pet.age_years} years old`;
  const conditions =
    pet.medical_conditions?.length > 0
      ? `Known medical conditions: ${pet.medical_conditions.join(", ")}.`
      : "No known medical conditions.";
  return `Patient: ${pet.pet_name}, ${pet.breed} (${pet.species}), ${ageStr}, ${pet.weight_kg} kg. ${conditions}`;
}

// Current medications, with dates and whether they are ongoing — so the AI can
// account for drug interactions, recent prescriptions, and treatment context.
export function formatMedications(meds: MedicationContext[]): string {
  if (meds.length === 0) return "No medications on record.";
  return meds
    .map((m) => {
      const parts = [m.name];
      if (m.dosage) parts.push(m.dosage);
      if (m.frequency) parts.push(m.frequency);
      let when = "";
      if (m.started_at && m.ended_at) when = ` (from ${m.started_at} to ${m.ended_at})`;
      else if (m.started_at) when = ` (since ${m.started_at}, ongoing)`;
      else if (m.ended_at) when = ` (until ${m.ended_at})`;
      const status = m.active === false ? " [inactive]" : "";
      return `- ${parts.join(", ")}${when}${status}`;
    })
    .join("\n");
}

// A short timeline of this pet's prior completed assessments so the AI can see
// what was found before (e.g. a vet visit between then and now) and build on it.
export function formatPriorAssessments(prior: PriorAssessment[]): string {
  if (prior.length === 0) return "No prior assessments for this pet.";
  return prior
    .map((a) => {
      const date = a.created_at.slice(0, 10);
      const risk = a.risk_classification ?? "—";
      const symptoms =
        a.symptomNames.length > 0 ? a.symptomNames.join(", ") : "n/a";
      const lines = [
        `- ${date} — risk ${risk}; symptoms: ${symptoms}`,
      ];
      if (a.primary_concern) lines.push(`  concern: ${a.primary_concern}`);
      if (a.recommended_action)
        lines.push(`  advised: ${a.recommended_action}`);
      return lines.join("\n");
    })
    .join("\n");
}

// Vet appointments (upcoming + recent past), including what the vet advised
// (outcome) and the owner's observations — useful context for triage.
export function formatAppointments(appts: AppointmentContext[]): string {
  if (appts.length === 0) return "No appointments on record.";
  return appts
    .map((a) => {
      const date = a.scheduled_at.slice(0, 10);
      const extra: string[] = [];
      if (a.reason) extra.push(`reason: ${a.reason}`);
      if (a.notes) extra.push(`owner notes: ${a.notes}`);
      if (a.outcome) extra.push(`vet outcome: ${a.outcome}`);
      const tail = extra.length > 0 ? `\n  ${extra.join("; ")}` : "";
      return `- ${date} — ${a.title}${tail}`;
    })
    .join("\n");
}

// Symptoms currently tracked for the pet (with how long they've been present).
export function formatActiveSymptoms(items: ActiveSymptomContext[]): string {
  if (items.length === 0) return "No actively tracked symptoms.";
  return items
    .map((s) => {
      const bits = [s.name];
      if (s.severity && s.severity !== "unknown") bits.push(s.severity);
      if (s.status) bits.push(s.status);
      const since = s.detected_at ? ` (since ${s.detected_at})` : "";
      return `- ${bits.join(", ")}${since}`;
    })
    .join("\n");
}

// Combines medications + active symptoms + appointments + history into one
// block for prompts. Empty string when there is nothing extra to add.
export function formatClinicalContext(
  meds: MedicationContext[],
  prior: PriorAssessment[],
  appts: AppointmentContext[] = [],
  activeSymptoms: ActiveSymptomContext[] = [],
): string {
  const sections: string[] = [];
  if (activeSymptoms.length > 0)
    sections.push(
      `Currently tracked symptoms:\n${formatActiveSymptoms(activeSymptoms)}`,
    );
  if (meds.length > 0)
    sections.push(`Current medications:\n${formatMedications(meds)}`);
  if (appts.length > 0)
    sections.push(`Vet appointments (recent/upcoming):\n${formatAppointments(appts)}`);
  if (prior.length > 0)
    sections.push(`Prior assessments (most recent first):\n${formatPriorAssessments(prior)}`);
  return sections.join("\n\n");
}

export function formatChunks(chunks: Chunk[]): string {
  if (chunks.length === 0)
    return "No specific veterinary guidance retrieved for this case.";
  return chunks
    .map((c, i) => `[${i + 1}] ${c.text.trim()}\nSource: ${c.source}`)
    .join("\n\n");
}
