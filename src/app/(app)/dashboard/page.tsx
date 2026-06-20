import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { PetCard } from "@/components/pets/pet-card";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard · PitsyPet" };

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: pets } = await supabase
    .from("pets")
    .select(
      "pet_id, pet_name, species, breed, age_years, age_months, weight_kg, medical_conditions",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const displayName = profile?.name ?? user?.email ?? "there";
  const hasPets = (pets?.length ?? 0) > 0;

  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-2xl font-semibold">
            Welcome, {displayName}
          </h1>
          <p className="text-muted-foreground">
            {hasPets
              ? "Select a pet to start a symptom assessment."
              : "Add a pet profile to get started."}
          </p>
        </div>
        {hasPets && (
          <Link href="/pets/new" className={cn(buttonVariants())}>
            Add pet
          </Link>
        )}
      </div>

      {hasPets ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets!.map((pet) => (
            <PetCard key={pet.pet_id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="font-medium">No pets yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first pet profile so PitsyPet can tailor its triage to
            their species, breed, and age.
          </p>
          <Link href="/pets/new" className={cn(buttonVariants())}>
            Add your first pet
          </Link>
        </div>
      )}
    </section>
  );
}
