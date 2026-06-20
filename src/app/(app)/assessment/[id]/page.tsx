import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/assessment/chat-interface";

export const metadata = { title: "Assessment · PitsyPet" };

// The [id] slug here is a pet id — each visit starts a fresh assessment row for
// that pet. The chat streams into it and onFinish persists results. (Sibling
// route [id]/results/ keys off the assessment id; Next.js requires the same
// slug name at this path level, hence [id] rather than [petId].)
export default async function AssessmentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pet } = await supabase
    .from("pets")
    .select("pet_id, pet_name")
    .eq("pet_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) {
    notFound();
  }

  const { data: assessment, error } = await supabase
    .from("assessments")
    .insert({ pet_id: pet.pet_id, user_id: user!.id })
    .select("assessment_id")
    .single();
  if (error || !assessment) {
    throw new Error("Could not start assessment");
  }

  return (
    <ChatInterface
      petId={pet.pet_id}
      assessmentId={assessment.assessment_id}
      petName={pet.pet_name}
    />
  );
}
