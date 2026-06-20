import type { RiskClassification } from "./schemas";

// Rule-based classifier used when the AI model is unavailable or repeatedly
// fails to produce a valid object. Deliberately simple and conservative:
// severity scores sum over the symptom text, and ties round UP. The
// deterministic safety override in classifier.ts still runs after this.
const SEVERITY_SCORES: [RegExp, number][] = [
  // Emergencies
  [/seizure|seizing|fitting|convuls/i, 10],
  [/not breathing|can'?t breathe|difficulty breathing|gasping|choking/i, 10],
  [/collapse|unconscious|unresponsive|passed out|faint/i, 10],
  [/bloat|distended|swollen (belly|abdomen|stomach)|retching/i, 10],
  [/can'?t (pee|urinate)|straining to (pee|urinate)|blocked|no urine/i, 10],
  [/poison|toxic|chocolate|rat bait|snail bait|xylitol|antifreeze|grapes|onion/i, 10],
  [/pale gums|white gums|blue gums/i, 9],
  [/hit by (a )?car|trauma|fell from|attacked/i, 8],
  [/bleeding|haemorrhag|hemorrhag/i, 7],
  [/severe pain|crying|screaming|whimpering/i, 6],
  // Moderate
  [/vomit/i, 4],
  [/diarrh/i, 4],
  [/fever|very hot/i, 4],
  [/letharg|weak|very tired|listless/i, 3],
  [/not eating|loss of appetite|won'?t eat|off (his|her) food/i, 3],
  [/limp|lame/i, 3],
  [/cough/i, 3],
  [/swelling|swollen/i, 3],
  // Mild
  [/sneez/i, 1],
  [/itch|scratch/i, 1],
  [/runny (nose|eyes)/i, 1],
];

export function fallbackClassify(symptomsText: string): RiskClassification {
  const score = SEVERITY_SCORES.reduce(
    (sum, [re, value]) => (re.test(symptomsText) ? sum + value : sum),
    0,
  );

  const riskLevel: RiskClassification["riskLevel"] =
    score >= 10 ? "High" : score >= 5 ? "Medium" : "Low";

  const recommendedAction =
    riskLevel === "High"
      ? "Seek immediate veterinary care — do not wait."
      : riskLevel === "Medium"
        ? "Arrange a veterinary appointment within 24 hours and monitor closely."
        : "Monitor at home and contact your vet if symptoms worsen or persist beyond 24–48 hours.";

  return {
    riskLevel,
    confidenceScore: 0.65,
    primaryConcern: "Symptom-based triage (automated fallback)",
    clinicalReasoning:
      "This assessment was produced by PitsyPet's rule-based fallback because the AI model was unavailable. " +
      "It scores the reported symptoms against a conservative severity rubric and rounds uncertainty upward. " +
      "Because it cannot reason about your pet's full context, please treat it cautiously and consult a veterinarian.",
    recommendedAction,
    redFlags: [
      "Difficulty breathing, collapse, or seizures",
      "Pale or blue gums",
      "Repeated vomiting, bloating, or inability to urinate",
      "Any rapid worsening",
    ],
    aboutSymptoms:
      "These symptoms were assessed automatically. A veterinarian can examine your pet and confirm the cause.",
  };
}
