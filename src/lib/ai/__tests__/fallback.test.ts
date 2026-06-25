import { describe, it, expect } from "vitest";

import { fallbackClassify } from "../fallback";

// The rule-based fallback sums severity scores over the symptom text and rounds
// up: score >= 10 → High, >= 5 → Medium, else Low. These tests lock in the
// CURRENT scoring (calibration is a separate, vet-driven concern).
describe("fallbackClassify — severity scoring & thresholds", () => {
  it("scores a single emergency symptom as High", () => {
    expect(fallbackClassify("she had a seizure").riskLevel).toBe("High");
    expect(fallbackClassify("my dog ate chocolate").riskLevel).toBe("High");
  });

  it("scores two moderate symptoms as Medium", () => {
    // vomit (4) + lethargy (3) = 7 → Medium
    expect(fallbackClassify("vomiting and lethargic").riskLevel).toBe("Medium");
    // cough (3) + not eating (3) = 6 → Medium
    expect(fallbackClassify("coughing and not eating").riskLevel).toBe("Medium");
  });

  it("scores a single mild symptom as Low", () => {
    expect(fallbackClassify("just some sneezing").riskLevel).toBe("Low");
    // itch (1) + runny nose (1) = 2 → Low
    expect(fallbackClassify("itchy with a runny nose").riskLevel).toBe("Low");
  });

  it("always reports it used the automated fallback rubric", () => {
    const r = fallbackClassify("vomiting");
    expect(r.primaryConcern).toMatch(/fallback/i);
    expect(r.confidenceScore).toBeGreaterThan(0);
    expect(r.redFlags.length).toBeGreaterThan(0);
  });

  it("matches the High recommendedAction wording for High cases", () => {
    expect(fallbackClassify("seizure").recommendedAction).toMatch(
      /immediate/i,
    );
  });
});
