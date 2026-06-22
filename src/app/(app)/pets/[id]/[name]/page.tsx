import Link from "next/link";
import { notFound } from "next/navigation";
import { Dog, Cat, Sparkles } from "lucide-react";

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
  type VetDoctor,
} from "@/components/pets/vet-contacts-section";
import {
  AppointmentsSection,
  type Appointment,
} from "@/components/pets/appointments-section";
import {
  ActiveSymptomsSection,
  type ActiveSymptom,
} from "@/components/pets/active-symptoms-section";
import type { ServiceHour } from "@/lib/validations/vet-contact";
import { AssistantChat } from "@/components/assistant/assistant-chat";

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

  const [
    { data: assessmentRows },
    { data: medRows },
    { data: vetRows },
    { data: doctorRows },
    { data: apptRows },
    { data: symptomRows },
  ] = await Promise.all([
    supabase
      .from("assessments")
      .select(
        "assessment_id, risk_classification, primary_concern, recommended_action, extracted_symptoms, follow_ups, created_at",
      )
      .eq("pet_id", pet.pet_id)
      .not("completed_at", "is", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("medications")
      .select(
        "medication_id, name, dosage, dosage_unit, quantity, frequency, prescribed_by, started_at, ended_at, notes, active",
      )
      .eq("pet_id", pet.pet_id)
      .is("deleted_at", null)
      .order("active", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("vet_contacts")
      .select(
        "vet_contact_id, clinic_name, phone, email, address, service_hours, notes",
      )
      .eq("pet_id", pet.pet_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("vet_doctors")
      .select(
        "doctor_id, vet_contact_id, name, specialty, phone, email, notes",
      )
      .eq("pet_id", pet.pet_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("appointments")
      .select(
        "appointment_id, title, scheduled_at, reason, notes, outcome, vet_contact_id",
      )
      .eq("pet_id", pet.pet_id)
      .is("deleted_at", null)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("active_symptoms")
      .select(
        "symptom_id, name, severity, status, detected_at, resolved_at, notes",
      )
      .eq("pet_id", pet.pet_id)
      .is("deleted_at", null)
      // Active/worsened first, resolved last; then most recent.
      .order("status", { ascending: true })
      .order("detected_at", { ascending: false }),
  ]);

  const assessments: AssessmentSummary[] = (assessmentRows ?? []).map((a) => ({
    assessment_id: a.assessment_id,
    pet_name: pet.pet_name,
    risk_classification: a.risk_classification,
    primary_concern: a.primary_concern,
    recommended_action: a.recommended_action,
    symptoms: Array.isArray(a.extracted_symptoms)
      ? (a.extracted_symptoms as unknown[])
          .map((s) =>
            s && typeof s === "object" && "name" in s
              ? String((s as { name: unknown }).name)
              : null,
          )
          .filter((n): n is string => !!n)
      : [],
    follow_up_count: Array.isArray(a.follow_ups) ? a.follow_ups.length : 0,
    created_at: a.created_at,
  }));
  const medications = (medRows ?? []) as Medication[];

  // Group doctors under their clinic.
  const doctorsByClinic = new Map<string, VetDoctor[]>();
  for (const d of doctorRows ?? []) {
    const list = doctorsByClinic.get(d.vet_contact_id) ?? [];
    list.push({
      doctor_id: d.doctor_id,
      name: d.name,
      specialty: d.specialty,
      phone: d.phone,
      email: d.email,
      notes: d.notes,
    });
    doctorsByClinic.set(d.vet_contact_id, list);
  }
  const vetContacts: VetContact[] = (vetRows ?? []).map((c) => ({
    vet_contact_id: c.vet_contact_id,
    clinic_name: c.clinic_name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    service_hours: (Array.isArray(c.service_hours)
      ? c.service_hours
      : []) as unknown as ServiceHour[],
    notes: c.notes,
    doctors: doctorsByClinic.get(c.vet_contact_id) ?? [],
  }));
  const appointments = (apptRows ?? []) as Appointment[];
  const activeSymptoms = (symptomRows ?? []) as ActiveSymptom[];
  const clinicOptions = vetContacts.map((c) => ({
    vet_contact_id: c.vet_contact_id,
    clinic_name: c.clinic_name,
  }));
  // Doctor names from saved clinics → "Prescribed by" suggestions on meds.
  const doctorOptions = Array.from(
    new Set(
      (doctorRows ?? [])
        .map((d) => d.name)
        .filter((n): n is string => !!n && n.trim().length > 0),
    ),
  ).sort();

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

      <ActiveSymptomsSection petId={pet.pet_id} symptoms={activeSymptoms} />

      <div className="grid gap-4">
        <VetContactsSection petId={pet.pet_id} contacts={vetContacts} />
        <AppointmentsSection
          petId={pet.pet_id}
          appointments={appointments}
          clinics={clinicOptions}
          nowIso={new Date().toISOString()}
        />
        <MedicationsSection
          petId={pet.pet_id}
          medications={medications}
          doctorOptions={doctorOptions}
        />
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

      <div className="grid gap-3 rounded-xl border p-4">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Sparkles className="size-5" aria-hidden /> Ask about {pet.pet_name}
        </h2>
        <AssistantChat
          scope="pet"
          petId={pet.pet_id}
          petName={pet.pet_name}
          greeting={`Hi! Ask me anything about ${pet.pet_name}, or tell me what to record — a medication, appointment, vet, or a symptom update. I'll show a Confirm button before saving anything.`}
          inputPlaceholder={`Ask about ${pet.pet_name}…`}
          className="h-[28rem]"
        />
      </div>
    </section>
  );
}
