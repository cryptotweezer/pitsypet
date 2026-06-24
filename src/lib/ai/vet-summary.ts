import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

import type { ExportRecord, VetSummary, ExportBlock } from "@/lib/export/types";

const MODEL = "claude-sonnet-4-6";

// Structured handover written FOR A VETERINARIAN. Priority is set deterministically
// from the stored risk elsewhere, so it is intentionally NOT part of this schema —
// the summary model writes prose only and can never lower the case's urgency.
const VetSummarySchema = z.object({
  headline: z
    .string()
    .describe("One factual sentence framing the case for the vet."),
  summary: z
    .string()
    .describe(
      "1–2 short paragraphs synthesising the presenting concern, how it evolved across the initial assessment and any follow-ups, and relevant history. Triage context, not a diagnosis.",
    ),
  symptomTimeline: z
    .array(z.string())
    .describe(
      "Chronological bullet points tracing the symptoms across visits (e.g. onset, severity changes, what resolved/worsened).",
    ),
  medicationsNote: z
    .string()
    .nullable()
    .describe(
      "A short note on current medications relevant to the case, or null if none are relevant.",
    ),
  recommendedFocus: z
    .array(z.string())
    .describe(
      "What the vet may want to prioritise or check first. Suggestions for attention, NOT a diagnosis or prescription.",
    ),
});

function blockToText(b: ExportBlock): string {
  const lines = [`${b.label} (${b.date.slice(0, 10)}) — risk: ${b.risk ?? "n/a"}`];
  if (b.primaryConcern) lines.push(`  Primary concern: ${b.primaryConcern}`);
  if (b.symptoms.length > 0) {
    lines.push(
      "  Symptoms: " +
        b.symptoms
          .map((s) => {
            const extra = [s.severity, s.status, s.onset, s.frequency]
              .filter(Boolean)
              .join(", ");
            return extra ? `${s.name} (${extra})` : s.name;
          })
          .join("; "),
    );
  }
  if (b.clinicalReasoning) lines.push(`  Reasoning: ${b.clinicalReasoning}`);
  if (b.recommendedAction) lines.push(`  Recommended action: ${b.recommendedAction}`);
  if (b.redFlags.length > 0) lines.push(`  Red flags: ${b.redFlags.join("; ")}`);
  return lines.join("\n");
}

function recordToText(r: ExportRecord): string {
  const parts: string[] = [];
  parts.push(
    `Patient: ${r.pet.name}, ${r.pet.breed} ${r.pet.species}, ${r.pet.ageLabel}, ${r.pet.weightKg} kg.`,
  );
  if (r.pet.conditions.length > 0)
    parts.push(`Known conditions: ${r.pet.conditions.join(", ")}.`);
  const medLine = (m: ExportRecord["medications"][number]): string => {
    const base = [m.name, m.dosage, m.frequency].filter(Boolean).join(" ");
    const dates =
      m.startedAt && m.endedAt
        ? `${m.startedAt} to ${m.endedAt}`
        : m.startedAt
          ? `started ${m.startedAt}`
          : m.endedAt
            ? `until ${m.endedAt}`
            : "no dates recorded";
    return `${base} (${dates})`;
  };
  const current = r.medications.filter((m) => m.active);
  const past = r.medications.filter((m) => !m.active);
  parts.push(
    current.length > 0
      ? "Current medications: " + current.map(medLine).join("; ") + "."
      : "Current medications: none recorded.",
  );
  if (past.length > 0) {
    parts.push("Past medications: " + past.map(medLine).join("; ") + ".");
  }
  parts.push("", blockToText(r.initial));
  for (const f of r.followUps) parts.push("", blockToText(f));
  return parts.join("\n");
}

// Deterministic minimal summary if the model call fails — the export must never
// hard-fail just because the AI prose is unavailable.
function fallbackSummary(record: ExportRecord): VetSummary {
  const all = [record.initial, ...record.followUps];
  return {
    headline: `${record.pet.name}: ${record.initial.primaryConcern ?? "triage record"}.`,
    summary:
      record.initial.clinicalReasoning ??
      "AI summary unavailable — see the assessment details below.",
    symptomTimeline: all.map(
      (b) =>
        `${b.label} (${b.date.slice(0, 10)}): ${
          b.symptoms.map((s) => s.name).join(", ") || "no symptoms recorded"
        }`,
    ),
    medicationsNote:
      record.medications.length > 0
        ? record.medications
            .map((m) => [m.name, m.dosage].filter(Boolean).join(" "))
            .join("; ")
        : null,
    recommendedFocus: record.initial.redFlags.length
      ? record.initial.redFlags
      : [record.initial.recommendedAction ?? "See assessment details."],
  };
}

export async function generateVetSummary(
  record: ExportRecord,
): Promise<VetSummary> {
  const system =
    "You are writing a concise CLINICAL HANDOVER for a veterinarian, based on an " +
    "owner-facing AI triage record. This is triage context to help the vet prioritise " +
    "the case — it is NOT a diagnosis and must not read as one. Use ONLY the provided " +
    "data; never invent findings, test results, or diagnoses. Synthesise the timeline " +
    "across the initial assessment and follow-ups, note relevant medications and history, " +
    "and be factual and succinct. Never downplay urgency.";

  try {
    const { object } = await generateObject({
      model: anthropic(MODEL),
      schema: VetSummarySchema,
      system,
      prompt: recordToText(record),
      temperature: 0.3,
    });
    return object;
  } catch {
    return fallbackSummary(record);
  }
}
