import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PetForm } from "@/components/pets/pet-form";

export const metadata = { title: "Edit pet · PitsyPet" };

export default async function EditPetPage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const supabase = await createClient();

  // RLS scopes this to the owner; a non-owned or deleted slug returns no row.
  const { data: pet } = await supabase
    .from("pets")
    .select(
      "pet_id, pet_name, species, breed, age_years, age_months, weight_kg, medical_conditions",
    )
    .eq("slug", params.slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (!pet) {
    notFound();
  }

  return (
    <section className="mx-auto grid max-w-lg gap-6">
      <div className="grid gap-1">
        <h1 className="font-heading text-2xl font-semibold">
          Edit {pet.pet_name}
        </h1>
        <p className="text-muted-foreground">Update your pet&apos;s details.</p>
      </div>
      <PetForm mode="edit" pet={pet} />
    </section>
  );
}
