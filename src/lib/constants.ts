// Australian states/territories. Used at registration (profiles.state) and
// later to surface state-specific emergency vet contacts (Phase 6).
export const AU_STATES = [
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "ACT",
  "NT",
] as const;

export type AuState = (typeof AU_STATES)[number];
