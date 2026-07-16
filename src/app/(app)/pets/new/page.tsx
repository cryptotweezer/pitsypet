import { PetForm } from "@/components/pets/pet-form";

export const metadata = { title: "Add pet · PitsyPet" };

export default function NewPetPage() {
  return (
    <section className="mx-auto grid max-w-lg gap-6">
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          NEW PET
        </span>
        <h1 className="font-display text-2xl tracking-tight text-brand md:text-3xl">
          Add a pet
        </h1>
        <p className="font-light text-on-surface-variant">
          We use these details to tailor the symptom assessment.
        </p>
      </div>
      <div className="rounded-[2rem] border border-outline-variant/20 bg-white p-6">
        <PetForm mode="create" />
      </div>
    </section>
  );
}
