// A medication is currently active if it has no end date, or its end date is
// today or later. The stored `active` boolean is a write-time convenience that
// can go stale (a future end date silently passing), so anything that asks "is
// this med current right now?" should derive it from `ended_at` instead of
// trusting the flag. ISO date strings ("YYYY-MM-DD") compare correctly with >=.
export function isMedicationActive(endedAt?: string | null): boolean {
  if (!endedAt) return true;
  return endedAt >= new Date().toISOString().slice(0, 10);
}
