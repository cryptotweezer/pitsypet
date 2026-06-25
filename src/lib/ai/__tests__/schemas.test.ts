import { describe, it, expect } from "vitest";

import {
  RiskClassificationSchema,
  RecordSymptomsSchema,
  ExtractedSymptomSchema,
} from "../schemas";

describe("RiskClassificationSchema", () => {
  const valid = {
    riskLevel: "High",
    confidenceScore: 0.8,
    primaryConcern: "GDV",
    clinicalReasoning: "…",
    recommendedAction: "Seek immediate care.",
    redFlags: ["bloat"],
    aboutSymptoms: "…",
  };

  it("accepts a valid classification", () => {
    expect(RiskClassificationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid risk level", () => {
    const r = RiskClassificationSchema.safeParse({
      ...valid,
      riskLevel: "Critical",
    });
    expect(r.success).toBe(false);
  });

  it("rejects an out-of-range confidence score", () => {
    expect(
      RiskClassificationSchema.safeParse({ ...valid, confidenceScore: 1.5 })
        .success,
    ).toBe(false);
    expect(
      RiskClassificationSchema.safeParse({ ...valid, confidenceScore: -0.1 })
        .success,
    ).toBe(false);
  });

  it("defaults redFlags to an empty array when omitted", () => {
    const { redFlags, ...withoutFlags } = valid;
    void redFlags;
    const r = RiskClassificationSchema.parse(withoutFlags);
    expect(r.redFlags).toEqual([]);
  });
});

describe("ExtractedSymptomSchema", () => {
  it("defaults severity and status", () => {
    const r = ExtractedSymptomSchema.parse({ name: "vomiting" });
    expect(r.severity).toBe("unknown");
    expect(r.status).toBe("present");
  });

  it("rejects an empty name", () => {
    expect(ExtractedSymptomSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects an invalid severity enum", () => {
    expect(
      ExtractedSymptomSchema.safeParse({ name: "x", severity: "extreme" })
        .success,
    ).toBe(false);
  });
});

describe("RecordSymptomsSchema", () => {
  const base = {
    extractedSymptoms: [{ name: "vomiting" }],
    isComplete: false,
    confidenceScore: 0.5,
  };

  it("accepts a valid payload and defaults suggestedReplies", () => {
    const r = RecordSymptomsSchema.parse(base);
    expect(r.suggestedReplies).toEqual([]);
  });

  it("rejects more than 4 suggested replies", () => {
    const r = RecordSymptomsSchema.safeParse({
      ...base,
      suggestedReplies: ["a", "b", "c", "d", "e"],
    });
    expect(r.success).toBe(false);
  });

  it("rejects a confidence score above 1", () => {
    expect(
      RecordSymptomsSchema.safeParse({ ...base, confidenceScore: 2 }).success,
    ).toBe(false);
  });
});
