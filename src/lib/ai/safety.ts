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
