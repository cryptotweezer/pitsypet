import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// Shared active-symptoms reconciliation, used by BOTH the assessment/follow-up
// completion path and the contextual AI chat tool (Group D). The active-symptom
// tracker is a shared responsibility: the AI carries the pet's known active
// symptoms into each conversation, updates their state as the owner reports
// change, and adds new ones — then this function writes that reconciled picture
// back to the tracker.
//
// Design notes:
// - Resolution is EXPLICIT: a symptom is only resolved when the owner reports it
//   gone. We never auto-resolve a tracked symptom just because it wasn't
//   mentioned (absence ≠ recovery). The AI carries forward unchanged symptoms as
//   "present", so they simply stay active.
// - Matching is canonicalised (lowercased, punctuation/​separators stripped,
//   token-subset) so differently-phrased duplicates collapse — e.g. "sleepiness"
//   matches "sleepiness/lethargy". Because the AI works from the existing tracked
//   names, matches are usually exact anyway; canonicalisation is the backstop.

export type DetectedStatus = "present" | "improving" | "worsened" | "resolved";
export type TrackerStatus = "active" | "improving" | "worsened" | "resolved";

export type ReconcileSymptom = {
  name: string;
  severity?: string | null;
  status?: DetectedStatus | null;
};

type Supabase = SupabaseClient<Database>;

export function canonical(name: string): string {
  return name
    .toLowerCase()
    .replace(/[/,;|]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(name: string): Set<string> {
  return new Set(canonical(name).split(" ").filter(Boolean));
}

function isSubset(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0) return false;
  return Array.from(a).every((t) => b.has(t));
}

// Two symptom names are "the same" if their canonical forms match, or one's
// token set is contained in the other's.
function sameSymptom(aTokens: Set<string>, bTokens: Set<string>): boolean {
  return isSubset(aTokens, bTokens) || isSubset(bTokens, aTokens);
}

// Whether two symptom names refer to the same symptom under the canonical,
// token-subset matching used to dedup the tracker. Exported for testing.
export function symptomsMatch(a: string, b: string): boolean {
  return sameSymptom(tokenSet(a), tokenSet(b));
}

export function mapStatus(s?: DetectedStatus | null): TrackerStatus {
  switch (s) {
    case "improving":
      return "improving";
    case "worsened":
      return "worsened";
    case "resolved":
      return "resolved";
    default:
      return "active";
  }
}

// Reconcile the pet's active-symptoms tracker against the symptoms reported in a
// conversation. Best-effort and idempotent enough to run on every completion.
export async function reconcileActiveSymptoms(
  supabase: Supabase,
  petId: string,
  userId: string,
  detected: ReconcileSymptom[],
  source: "assessment" | "followup" | "chat",
): Promise<void> {
  // Load ALL non-deleted tracked symptoms, INCLUDING resolved ones. Matching a
  // re-detected symptom against a resolved row (instead of only against active
  // rows) is what prevents duplicates: if a previously-resolved symptom comes up
  // again, we update that same row rather than inserting a second copy with the
  // same name.
  const { data: tracked } = await supabase
    .from("active_symptoms")
    .select("symptom_id, name, severity, status")
    .eq("pet_id", petId)
    .is("deleted_at", null);

  const trackedList = (tracked ?? []).map((t) => ({
    symptom_id: t.symptom_id,
    tokens: tokenSet(t.name),
  }));

  const today = new Date().toISOString().slice(0, 10);
  const usedIds = new Set<string>();
  const inserts: Database["public"]["Tables"]["active_symptoms"]["Insert"][] =
    [];

  for (const d of detected) {
    const name = d.name?.trim();
    if (!name) continue;
    const dTokens = tokenSet(name);
    const trackerStatus = mapStatus(d.status);
    const severity =
      d.severity && d.severity !== "unknown" ? d.severity : null;

    const match = trackedList.find(
      (t) => !usedIds.has(t.symptom_id) && sameSymptom(dTokens, t.tokens),
    );

    if (match) {
      usedIds.add(match.symptom_id);
      const patch =
        trackerStatus === "resolved"
          ? { status: "resolved", resolved_at: today }
          : {
              status: trackerStatus,
              resolved_at: null,
              ...(severity ? { severity } : {}),
            };
      await supabase
        .from("active_symptoms")
        .update(patch)
        .eq("symptom_id", match.symptom_id);
      continue;
    }

    // Not tracked yet. A symptom reported as already gone is nothing to track.
    if (trackerStatus === "resolved") continue;
    inserts.push({
      pet_id: petId,
      user_id: userId,
      name,
      severity,
      status: trackerStatus,
      source,
      detected_at: today,
    });
  }

  if (inserts.length > 0) {
    await supabase.from("active_symptoms").insert(inserts);
  }
}
