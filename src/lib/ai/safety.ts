// Deterministic critical-symptom rubric. Matching forces a High classification
// and can only ESCALATE a model result — it never lowers one. Patterns cover
// clinical terms, common owner phrasing, and Australian vernacular.
//
// Patterns are matched against the formatted symptom text (see formatSymptoms),
// which contains machine-written fields such as "severity: moderate" alongside
// the owner's own words. Every alternative below must therefore be anchored so
// it cannot match a substring of an unrelated word: an unanchored /ate/ matched
// "moder-ate" and "w-ate-r", forcing High on any moderate-severity symptom or
// any mention of drinking water. Keep \b boundaries on short alternatives.
const CRITICAL_PATTERNS: RegExp[] = [
  /seizure|seizing|\bfitting\b|convuls/i,
  /can'?t breathe|difficulty breathing|struggling to breathe|gasping|choking|blue (tongue|gum)/i,
  /unresponsive|won'?t wake|unconscious|passed out|collaps|fainted/i,
  /bleeding (a lot|heavily|profusely)|won'?t stop bleeding|haemorrhag|hemorrhag/i,
  /pale (gums|tongue)|white gums/i,
  // GDV. Owners phrase the swelling in either order, so both are matched: the
  // adjective-first form ("swollen belly") and the noun-first form ("his belly
  // is swollen and hard"), which the original pattern missed entirely.
  /bloat|swollen (belly|abdomen|stomach|tummy)|(belly|abdomen|stomach|tummy) (is |feels |looks |seems )?(swollen|bloated|distended|hard|tight)|distended|retching (but )?nothing|unproductive vomit/i,
  // Urinary obstruction. A bare "blocked" also matched a blocked nose or ear, so
  // the word only counts alongside an explicitly urinary term.
  /can'?t (pee|urinate)|straining to (pee|urinate)|no urine|urinary (blockage|obstruction)|blocked (bladder|urethra)|(bladder|urethra) (is )?blocked/i,
  /heatstroke|overheat|too hot|panting (heavily|excessively)/i,
  // Toxic substances and baits: critical on their own, however they are phrased.
  /poison|toxic|chocolate|rat bait|snail bait|antifreeze|xylitol|grapes?|onion/i,
  // Ingestion of something unknown or non-food. The verb alone is NOT critical:
  // an owner answering "ate his dinner normally" must not be escalated, so the
  // verb has to be followed by an unknown or foreign object. Named toxins are
  // already covered by the pattern above, whatever verb introduces them.
  /\b(ate|eaten|swallowed|ingested|got into)\b[^.\n]{0,40}\b(something|anything|object|foreign|toy|sock|underwear|bone|rock|stone|string|ribbon|battery|pill|tablet|medication|medicine|drug|plant|mushroom|unknown|strange|weird)\b/i,
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
      recommendedAction: "Seek immediate veterinary care now, do not wait.",
    };
  }
  return result;
}
