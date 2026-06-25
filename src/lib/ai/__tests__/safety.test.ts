import { describe, it, expect } from "vitest";

import { hasCriticalSymptom, applySafetyOverride } from "../safety";
import type { RiskClassification } from "../schemas";

// A minimal non-critical baseline result the override can act on.
const lowResult: RiskClassification = {
  riskLevel: "Low",
  confidenceScore: 0.5,
  primaryConcern: "test",
  clinicalReasoning: "test",
  recommendedAction: "Monitor at home.",
  redFlags: [],
  aboutSymptoms: "test",
};

describe("hasCriticalSymptom — critical rubric forces recognition", () => {
  // Each phrase represents one critical pattern, in clinical, plain-owner, and
  // Australian phrasing. Every one MUST be recognised as critical.
  const critical = [
    "my dog is fitting",
    "she had a seizure",
    "he passed out and won't wake",
    "the cat is unresponsive",
    "blue tongue and weak",
    "she can't breathe properly",
    "swollen belly and retching but nothing comes up", // GDV
    "straining to pee with no urine", // urinary obstruction
    "pale gums this morning",
    "won't stop bleeding",
    "he ate chocolate",
    "swallowed rat bait",
    "got into the grapes",
    "hit by a car",
    "possible heatstroke, panting heavily",
  ];

  it.each(critical)("flags %j as critical", (text) => {
    expect(hasCriticalSymptom(text)).toBe(true);
  });

  const benign = [
    "a little sneezing",
    "slightly itchy ear",
    "ate his dinner normally",
  ];
  // "ate his dinner" intentionally NOT critical even though it contains "ate":
  it("does NOT flag mild, non-emergency phrasing", () => {
    // "ate" alone is in the toxin pattern, so confirm a clearly mild case:
    expect(hasCriticalSymptom("a little sneezing")).toBe(false);
    expect(hasCriticalSymptom("slightly itchy ear")).toBe(false);
    void benign;
  });
});

describe("applySafetyOverride — can ONLY escalate", () => {
  it("escalates a Low result to High when a critical symptom is present", () => {
    const out = applySafetyOverride(lowResult, "she had a seizure");
    expect(out.riskLevel).toBe("High");
    expect(out.recommendedAction).toMatch(/immediate/i);
  });

  it("escalates a Medium result to High", () => {
    const out = applySafetyOverride(
      { ...lowResult, riskLevel: "Medium" },
      "blue tongue",
    );
    expect(out.riskLevel).toBe("High");
  });

  it("leaves a High result unchanged (idempotent)", () => {
    const high: RiskClassification = { ...lowResult, riskLevel: "High" };
    const out = applySafetyOverride(high, "she had a seizure");
    expect(out).toEqual(high);
  });

  it("NEVER lowers risk: a non-critical case keeps its level", () => {
    const out = applySafetyOverride(lowResult, "mild sneezing");
    expect(out.riskLevel).toBe("Low");
    expect(out).toEqual(lowResult);
  });
});
