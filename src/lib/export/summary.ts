import { cleanAiText } from "@/lib/utils";
import type { ExportBlock, ExportRecord, VetSummary } from "@/lib/export/types";

// Deterministic vet handover assembled from the STORED assessment — no AI call.
// The triage AI already wrote the clinical prose (reasoning, recommended action,
// red flags) when the assessment completed; exporting just re-presents it, so a
// download is instant, free, and always available (no model, no timeout).
// Priority is computed separately from the stored risk and never appears here.

function clean(text: string | null): string | null {
  return text ? cleanAiText(text) : null;
}

function symptomLine(b: ExportBlock): string {
  const symptoms = b.symptoms
    .map((s) => {
      const extra = [s.severity, s.status]
        .filter((x) => x && x !== "unknown" && x !== "present")
        .join(", ");
      return extra ? `${s.name} (${extra})` : s.name;
    })
    .join("; ");
  return `${b.label} (${b.date.slice(0, 10)}), risk ${b.risk ?? "n/a"}: ${
    symptoms || "no symptoms recorded"
  }`;
}

export function buildVetSummary(record: ExportRecord): VetSummary {
  const blocks = [record.initial, ...record.followUps];
  const latest = blocks[blocks.length - 1];

  // The case narrative: the initial reasoning, plus the latest follow-up's
  // reasoning when the case has evolved since.
  const paragraphs: string[] = [];
  const initialReasoning = clean(record.initial.clinicalReasoning);
  if (initialReasoning) paragraphs.push(initialReasoning);
  if (record.followUps.length > 0) {
    const latestReasoning = clean(latest.clinicalReasoning);
    if (latestReasoning) {
      paragraphs.push(
        `Latest follow-up (${latest.date.slice(0, 10)}): ${latestReasoning}`,
      );
    }
  }

  const currentMeds = record.medications.filter((m) => m.active);

  // What the vet should look at first: the most recent block's red flags, or
  // its recommended action when no red flags were recorded.
  const focus =
    latest.redFlags.length > 0 ? latest.redFlags : record.initial.redFlags;
  const recommendedFocus = (
    focus.length > 0
      ? focus
      : [
          latest.recommendedAction ??
            record.initial.recommendedAction ??
            "See assessment details.",
        ]
  ).map((f) => cleanAiText(f));

  return {
    headline: `${record.pet.name}: ${
      clean(record.initial.primaryConcern) ?? "triage record"
    }.`,
    summary:
      paragraphs.join("\n\n") || "See the assessment details below.",
    symptomTimeline: blocks.map(symptomLine),
    medicationsNote:
      currentMeds.length > 0
        ? "Current: " +
          currentMeds
            .map((m) =>
              [m.name, m.dosage, m.frequency].filter(Boolean).join(" "),
            )
            .join("; ")
        : null,
    recommendedFocus,
  };
}
