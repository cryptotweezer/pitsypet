import Link from "next/link";
import { notFound } from "next/navigation";
import { Dog, Cat } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AssessmentCard,
  type AssessmentSummary,
} from "@/components/assessment/assessment-card";
import {
  MedicationsSection,
  type Medication,
} from "@/components/pets/medications-section";
import {
  VetContactsSection,
  type VetContact,
} from "@/components/pets/vet-contacts-section";

export const metadata = { title: "Pet · PitsyPet" };

function ageLabel(years: number, months: number | null): string {
  if (months && months > 0) return `${years}y ${months}m`;
  if (years === 0) return "<1 year";
  return `${years} ${years === 1 ? "year" : "years"}`;
}

export default async function PetPage({
  params,
}: {
  params: { id: string; name: string };
}) {
  const supabase = createClient();

  const { data: pet } = await supabase
    .from("pets")
    .select(
      "pet_id, pet_name, species, breed, age_years, age_months, weight_kg, medical_conditions",
    )
    .eq("pet_id", params.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) notFound();

  const [{ data: assessmentRows }, { data: medRows }, { data: vetRows }] =
    await Promise.all([
      supabase
        .from("assessments")
        .select("assessment_id, risk_classification, primary_concern, created_at")
        .eq("pet_id", pet.pet_id)
        .not("completed_at", "is", null)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("medications")
        .select(
          "medication_id, name, dosage, quantity, frequency, prescribed_by, started_at, ended_at, notes, active",
        )
        .eq("pet_id", pet.pet_id)
        .is("deleted_at", null)
        .order("active", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("vet_contacts")
        .select("vet_contact_id, doctor_name, clinic_name, phone, email, notes")
        .eq("pet_id", pet.pet_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);

  const assessments: AssessmentSummary[] = (assessmentRows ?? []).map((a) => ({
    assessment_id: a.assessment_id,
    pet_name: pet.pet_name,
    risk_classification: a.risk_classification,
    primary_concern: a.primary_concern,
    created_at: a.created_at,
  }));
  const medications = (medRows ?? []) as Medication[];
  const vetContacts = (vetRows ?? []) as VetContact[];

  const conditions = Array.isArray(pet.medical_conditions)
    ? pet.medical_conditions.filter((c): c is string => typeof c === "string")
    : [];
  const Icon = pet.species === "Cat" ? Cat : Dog;

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-6" aria-hidden />
          </span>
          <div className="grid gap-0.5">
            <h1 className="font-heading text-2xl font-semibold">
              {pet.pet_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pet.breed} · {pet.species} · {ageLabel(pet.age_years, pet.age_months)}{" "}
              · {pet.weight_kg} kg
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/assessment/${pet.pet_id}`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Start new assessment
          </Link>
          <Link
            href={`/pets/${pet.pet_id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Edit profile
          </Link>
        </div>
      </div>

      {conditions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Conditions:</span>
          {conditions.map((c, i) => (
            <Badge key={`${c}-${i}`} variant="secondary">
              {c}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <MedicationsSection petId={pet.pet_id} medications={medications} />
        <VetContactsSection petId={pet.pet_id} contacts={vetContacts} />
      </div>

      <div className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Assessment history</h2>
        {assessments.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {assessments.map((a) => (
              <AssessmentCard key={a.assessment_id} item={a} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            No assessments yet. Start one to begin {pet.pet_name}&apos;s clinical
            history.
          </p>
        )}
      </div>
    </section>
  );
}
