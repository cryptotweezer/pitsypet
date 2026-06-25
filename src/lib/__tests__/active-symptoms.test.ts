import { describe, it, expect } from "vitest";

import { canonical, symptomsMatch, mapStatus } from "../active-symptoms";

describe("canonical", () => {
  it("lowercases, splits separators, and strips punctuation", () => {
    expect(canonical("Sleepiness/Lethargy")).toBe("sleepiness lethargy");
    expect(canonical("  Vomiting!! ")).toBe("vomiting");
    expect(canonical("Loss of appetite")).toBe("loss of appetite");
  });
});

describe("symptomsMatch — canonical token-subset dedup", () => {
  it("matches exact / case- and punctuation-different names", () => {
    expect(symptomsMatch("Vomiting", "vomiting")).toBe(true);
    expect(symptomsMatch("loss of appetite", "Loss of Appetite")).toBe(true);
  });

  it("matches when one name's tokens are a subset of the other", () => {
    // "sleepiness" ⊆ "sleepiness/lethargy" → same symptom, differently phrased
    expect(symptomsMatch("sleepiness", "sleepiness/lethargy")).toBe(true);
    expect(symptomsMatch("sleepiness/lethargy", "sleepiness")).toBe(true);
  });

  it("does NOT match unrelated symptoms", () => {
    expect(symptomsMatch("vomiting", "diarrhea")).toBe(false);
    // token-based, not stemming: "limp" and "limping" are different tokens
    expect(symptomsMatch("limp", "limping")).toBe(false);
  });
});

describe("mapStatus — detected status → tracker status", () => {
  it("passes improving / worsened / resolved through", () => {
    expect(mapStatus("improving")).toBe("improving");
    expect(mapStatus("worsened")).toBe("worsened");
    expect(mapStatus("resolved")).toBe("resolved");
  });

  it("maps present / missing to active", () => {
    expect(mapStatus("present")).toBe("active");
    expect(mapStatus(null)).toBe("active");
    expect(mapStatus(undefined)).toBe("active");
  });
});
