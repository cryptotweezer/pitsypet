import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/assessment/chat-interface";

export const metadata = { title: "Assessment · PitsyPet" };

// The [id] slug here is a pet id. We mint a fresh assessment id here but do NOT
// insert a row — an assessment is only written to the DB once it COMPLETES (the
// chat route's onFinish upserts it). That way abandoning or refreshing mid-chat
// leaves no orphan rows; only finalized assessments exist. (Sibling route
// [id]/results/ keys off the assessment id; Next.js requires the same slug name
// at this path level, hence [id] rather than [petId].)
export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { followup?: string };
}) {
  const supabase = createClient();

  const { data: pet } = await supabase
    .from("pets")
    .select("pet_id, pet_name, medical_conditions")
    .eq("pet_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) {
    notFound();
  }

  // Surface the pet's known context in the sidebar (the AI already gets it).
  const conditions = Array.isArray(pet.medical_conditions)
    ? pet.medical_conditions.filter((c): c is string => typeof c === "string")
    : [];
  const { data: medRows } = await supabase
    .from("medications")
    .select("name, dosage, frequency")
    .eq("pet_id", pet.pet_id)
    .eq("active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  const medications = medRows ?? [];

  // Follow-up mode: continue an existing completed assessment. We reuse its id
  // so onFinish appends a dated section instead of creating a new row. RLS +
  // the pet_id match confirm ownership.
  let assessmentId = crypto.randomUUID();
  let isFollowUp = false;
  let greeting = `Hi! I'm here to help check on ${pet.pet_name}. What symptoms have you noticed?`;

  if (searchParams.followup) {
    const { data: original } = await supabase
      .from("assessments")
      .select("assessment_id, primary_concern")
      .eq("assessment_id", searchParams.followup)
      .eq("pet_id", pet.pet_id)
      .not("completed_at", "is", null)
      .is("deleted_at", null)
      .maybeSingle();
    if (original) {
      assessmentId = original.assessment_id;
      isFollowUp = true;
      greeting = original.primary_concern
        ? `Let's follow up on ${pet.pet_name}'s previous assessment (${original.primary_concern}). How have they been since then?`
        : `Let's follow up on ${pet.pet_name}'s previous assessment. How have they been since then?`;
    }
  }

  return (
    <ChatInterface
      petId={pet.pet_id}
      assessmentId={assessmentId}
      petName={pet.pet_name}
      isFollowUp={isFollowUp}
      greeting={greeting}
      conditions={conditions}
      medications={medications}
    />
  );
}
