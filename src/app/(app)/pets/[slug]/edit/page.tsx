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
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          EDIT PET
        </span>
        <h1 className="font-display text-2xl tracking-tight text-brand md:text-3xl">
          Edit {pet.pet_name}
        </h1>
        <p className="font-light text-on-surface-variant">
          Update your pet&apos;s details.
        </p>
      </div>
      <div className="rounded-[2rem] border border-outline-variant/20 bg-white p-6">
        <PetForm mode="edit" pet={pet} />
      </div>
    </section>
  );
}
