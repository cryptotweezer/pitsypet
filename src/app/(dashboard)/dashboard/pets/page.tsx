import { createClient } from "@/lib/supabase/server";
import { PetsSection } from "@/components/pets/pets-grid";
import { DeletedPetCard } from "@/components/pets/deleted-pet-card";

export const metadata = { title: "Pets · PitsyPet" };

export default async function DashboardPetsPage() {
  const supabase = await createClient();

  const { data: pets } = await supabase
    .from("pets")
    .select(
      "pet_id, pet_name, slug, species, breed, age_years, age_months, weight_kg, medical_conditions",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Soft-deleted pets — restorable, with their assessment history intact.
  const { data: deletedPets } = await supabase
    .from("pets")
    .select("pet_id, pet_name, species, breed")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  const hasDeletedPets = (deletedPets?.length ?? 0) > 0;

  return (
    <section className="grid gap-8">
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          YOUR PETS
        </span>
        <h1 className="font-display text-3xl tracking-tight text-brand md:text-4xl">
          Pets
        </h1>
        <p className="font-light text-on-surface-variant">
          Select a pet to open its clinical record or start an assessment.
        </p>
      </div>

      <PetsSection pets={pets ?? []} />

      {hasDeletedPets && (
        <div className="grid gap-3">
          <div className="grid gap-1">
            <h2 className="font-display text-2xl tracking-tight text-brand">
              Recently deleted
            </h2>
            <p className="text-sm font-light text-on-surface-variant">
              Restore a pet to bring back its profile and assessment history.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {deletedPets!.map((pet) => (
              <DeletedPetCard key={pet.pet_id} pet={pet} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
