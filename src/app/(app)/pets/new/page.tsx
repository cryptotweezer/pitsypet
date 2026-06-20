import { PetForm } from "@/components/pets/pet-form";

export const metadata = { title: "Add pet · PitsyPet" };

export default function NewPetPage() {
  return (
    <section className="mx-auto grid max-w-lg gap-6">
      <div className="grid gap-1">
        <h1 className="font-heading text-2xl font-semibold">Add a pet</h1>
        <p className="text-muted-foreground">
          We use these details to tailor the symptom assessment.
        </p>
      </div>
      <PetForm mode="create" />
    </section>
  );
}
