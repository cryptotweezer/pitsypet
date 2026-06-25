import { describe, it, expect } from "vitest";

import { isMedicationActive } from "../medications";

// "Active now" is derived from ended_at, never the stored flag (which can go
// stale when a future end date passes). Dates are far past/future so the result
// is stable regardless of when the test runs.
describe("isMedicationActive", () => {
  it("is active when there is no end date (ongoing)", () => {
    expect(isMedicationActive(null)).toBe(true);
    expect(isMedicationActive(undefined)).toBe(true);
    expect(isMedicationActive("")).toBe(true);
  });

  it("is active when the end date is in the future", () => {
    expect(isMedicationActive("2999-12-31")).toBe(true);
  });

  it("is finished when the end date is in the past", () => {
    expect(isMedicationActive("2000-01-01")).toBe(false);
  });

  it("is still active on the end date itself (inclusive)", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isMedicationActive(today)).toBe(true);
  });
});
