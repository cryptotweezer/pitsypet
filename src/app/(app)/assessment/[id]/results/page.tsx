import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ResultsView } from "@/components/assessment/results/results-view";

export const metadata = { title: "Assessment results · PitsyPet" };

// Legacy results URL, kept for old links and for callers that only know the
// assessment UUID (the chat's "View results" button, RPC search results).
// When the pet is still active it redirects to the canonical
// /pets/<slug>/results/<seq>; for a soft-deleted pet (no slug URL exists) it
// renders the results directly.
export default async function LegacyResultsPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const fromHistory = searchParams.from === "history";
  const supabase = await createClient();

  // RLS scopes this to the owner; a non-owner gets no row.
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("assessment_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!assessment) notFound();

  const { data: pet } = await supabase
    .from("pets")
    .select("slug, deleted_at")
    .eq("pet_id", assessment.pet_id)
    .maybeSingle();

  if (pet && !pet.deleted_at && assessment.seq) {
    redirect(
      `/pets/${pet.slug}/results/${assessment.seq}${fromHistory ? "?from=history" : ""}`,
    );
  }

  return <ResultsView assessment={assessment} fromHistory={fromHistory} />;
}
