// Deterministic critical-symptom rubric. Matching forces a High classification
// and can only ESCALATE a model result — it never lowers one. Patterns cover
// clinical terms, common owner phrasing, and Australian vernacular.
const CRITICAL_PATTERNS: RegExp[] = [
  /seizure|seizing|fitting|convuls/i,
  /can'?t breathe|difficulty breathing|struggling to breathe|gasping|choking|blue (tongue|gum)/i,
  /unresponsive|won'?t wake|unconscious|passed out|collaps|fainted/i,
  /bleeding (a lot|heavily|profusely)|won'?t stop bleeding|haemorrhag|hemorrhag/i,
  /pale (gums|tongue)|white gums/i,
  /bloat|swollen (belly|abdomen|stomach)|distended|retching (but )?nothing|unproductive vomit/i, // GDV
  /can'?t (pee|urinate)|straining to (pee|urinate)|blocked|no urine/i, // urinary obstruction
  /heatstroke|overheat|too hot|panting (heavily|excessively)/i,
  /ate|swallowed|ingested|poison|toxic|chocolate|rat bait|snail bait|antifreeze|xylitol|grapes|onion/i,
  /hit by (a )?car|trauma|fell from|attacked/i,
];

export function hasCriticalSymptom(text: string): boolean {
  return CRITICAL_PATTERNS.some((re) => re.test(text));
}

// Deterministic safety override: a critical symptom forces High. This can ONLY
// escalate — a result already at High (or a non-critical case) is returned
// unchanged. Extracted as a pure function so the "can only escalate" invariant
// is unit-testable without calling the model. Applied at the end of classifyRisk.
export function applySafetyOverride<
  T extends { riskLevel: "Low" | "Medium" | "High"; recommendedAction: string },
>(result: T, symptomsText: string): T {
  if (hasCriticalSymptom(symptomsText) && result.riskLevel !== "High") {
    return {
      ...result,
      riskLevel: "High",
      recommendedAction: "Seek immediate veterinary care — do not wait.",
    };
  }
  return result;
}
