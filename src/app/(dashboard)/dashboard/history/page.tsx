import { createClient } from "@/lib/supabase/server";
import {
  HistorySearch,
  type HistoryItem,
} from "@/components/history/history-search";

export const metadata = { title: "History · PitsyPet" };

export default async function DashboardHistoryPage() {
  const supabase = await createClient();

  const [{ data: pets }, { data: assessmentRows }] = await Promise.all([
    supabase
      .from("pets")
      .select("pet_id, pet_name")
      .is("deleted_at", null)
      .order("pet_name", { ascending: true }),
    // Default listing: every completed assessment, newest first. The free-text
    // search still goes through the search_assessments RPC (/api/search).
    supabase
      .from("assessments")
      .select(
        "assessment_id, risk_classification, primary_concern, created_at, pets(pet_name)",
      )
      .not("completed_at", "is", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const initialItems: HistoryItem[] = (assessmentRows ?? []).map((a) => ({
    assessment_id: a.assessment_id,
    pet_name:
      (a.pets as unknown as { pet_name: string } | null)?.pet_name ?? "—",
    risk_classification: a.risk_classification,
    primary_concern: a.primary_concern,
    created_at: a.created_at,
  }));

  return (
    <section className="grid gap-6">
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          ASSESSMENT HISTORY
        </span>
        <h1 className="font-display text-3xl tracking-tight text-brand">
          All assessments
        </h1>
        <p className="text-sm font-light text-on-surface-variant">
          Every completed assessment across your pets — filter by pet, or
          search by symptom, concern, or name.
        </p>
      </div>
      <HistorySearch pets={pets ?? []} initialItems={initialItems} />
    </section>
  );
}
