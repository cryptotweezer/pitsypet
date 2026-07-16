import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ResultsView } from "@/components/assessment/results/results-view";

export const metadata = { title: "Assessment results · PitsyPet" };

// Canonical results URL: /pets/<slug>/results/<seq> — the pet's slug plus the
// assessment's per-pet sequential number (assigned by the set_assessment_seq
// trigger, backfilled for older rows). Legacy /assessment/<uuid>/results links
// redirect here.
export default async function PetResultsPage(props: {
  params: Promise<{ slug: string; seq: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const seq = Number(params.seq);
  if (!Number.isInteger(seq) || seq < 1) notFound();

  const supabase = await createClient();

  // Slug is unique per user among active pets; RLS scopes the lookup.
  const { data: pet } = await supabase
    .from("pets")
    .select("pet_id")
    .eq("slug", params.slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) notFound();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("pet_id", pet.pet_id)
    .eq("seq", seq)
    .is("deleted_at", null)
    .maybeSingle();
  if (!assessment) notFound();

  return (
    <ResultsView
      assessment={assessment}
      fromHistory={searchParams.from === "history"}
    />
  );
}
