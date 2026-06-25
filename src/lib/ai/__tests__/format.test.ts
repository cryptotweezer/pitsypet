import { describe, it, expect } from "vitest";

import { formatPet, formatSymptoms } from "../format";

describe("formatPet", () => {
  const base = {
    pet_name: "Lola",
    species: "Dog",
    breed: "Beagle",
    age_years: 4,
    age_months: null as number | null,
    weight_kg: 12,
    medical_conditions: [] as string[],
  };

  it("includes name, breed, species, age, weight", () => {
    const out = formatPet(base);
    expect(out).toContain("Lola");
    expect(out).toContain("Beagle");
    expect(out).toContain("Dog");
    expect(out).toContain("4 years old");
    expect(out).toContain("12 kg");
  });

  it("lists known conditions, or says there are none", () => {
    expect(formatPet(base)).toContain("No known medical conditions");
    expect(
      formatPet({ ...base, medical_conditions: ["epilepsy", "arthritis"] }),
    ).toContain("epilepsy, arthritis");
  });

  it("uses yr/mo format when months are present", () => {
    expect(formatPet({ ...base, age_months: 6 })).toContain("4yr 6mo");
  });
});

describe("formatSymptoms", () => {
  it("returns a placeholder when empty", () => {
    expect(formatSymptoms([])).toMatch(/no symptoms/i);
  });

  it("renders details and surfaces a non-present status", () => {
    const out = formatSymptoms([
      { name: "vomiting", onset: "2 days ago", severity: "moderate", status: "worsened" },
    ]);
    expect(out).toContain("vomiting");
    expect(out).toContain("onset: 2 days ago");
    expect(out).toContain("severity: moderate");
    expect(out).toContain("status: worsened");
  });

  it("hides the unremarkable 'present' status and 'unknown' severity", () => {
    const out = formatSymptoms([
      { name: "sneezing", severity: "unknown", status: "present" },
    ]);
    expect(out).toContain("sneezing");
    expect(out).not.toContain("status:");
    expect(out).not.toContain("severity:");
  });
});
