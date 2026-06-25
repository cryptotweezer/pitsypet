import { describe, it, expect } from "vitest";

import { fallbackClassify } from "../fallback";
import { applySafetyOverride } from "../safety";
import type { RiskClassification } from "../schemas";

// Worst-case deterministic triage path: the AI model is unavailable, so
// classifyRisk falls back to the rule-based rubric and then applies the safety
// override. This composition is exactly what classifyRisk runs in that case, so
// it pins the guarantee that emergencies are NEVER under-triaged even with the
// model down — the single most safety-critical property of the product.
function worstCaseTriage(text: string): RiskClassification {
  return applySafetyOverride(fallbackClassify(text), text);
}

describe("triage regression — emergencies must be High (model-down path)", () => {
  const emergencies: [string, string][] = [
    ["GDV / bloat", "his belly is swollen and he keeps retching"],
    ["GDV via unproductive retching", "retching but nothing comes up"],
    ["seizure", "she had a seizure this morning"],
    ["respiratory distress", "the dog can't breathe and is gasping"],
    ["collapse", "he collapsed and won't wake up"],
    ["pale gums (override lifts fallback)", "she has pale gums this morning"],
    ["hit by car (override lifts fallback)", "he was hit by a car"],
    ["toxin — xylitol", "he ate something with xylitol"],
    ["toxin — grapes", "the dog got into the grapes"],
    ["urinary obstruction", "straining to pee and nothing comes out"],
    ["heavy bleeding + trauma", "deep wound that won't stop bleeding after a fall"],
  ];

  it.each(emergencies)("%s → High", (_label, text) => {
    expect(worstCaseTriage(text).riskLevel).toBe("High");
  });
});

describe("triage regression — non-emergencies are NOT force-escalated", () => {
  // Proves the deterministic path isn't a blunt "everything is High": genuinely
  // mild/moderate, non-red-flag cases keep a lower level.
  const cases: [string, RiskClassification["riskLevel"]][] = [
    ["just a bit of sneezing", "Low"],
    ["itchy with a runny nose", "Low"],
    ["vomited once and seems lethargic", "Medium"],
    ["coughing and not eating much", "Medium"],
  ];

  it.each(cases)("%j → %s", (text, expected) => {
    expect(worstCaseTriage(text).riskLevel).toBe(expected);
  });
});
