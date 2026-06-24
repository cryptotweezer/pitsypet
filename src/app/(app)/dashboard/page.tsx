import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { PetCard } from "@/components/pets/pet-card";
import { DeletedPetCard } from "@/components/pets/deleted-pet-card";
import { DashboardChatWidget } from "@/components/assistant/dashboard-chat-widget";
import {
  VetContactsManager,
  type VetContact,
  type VetDoctor,
} from "@/components/vet/vet-contacts-manager";
import {
  DashboardAppointments,
  type DashboardAppointment,
} from "@/components/appointments/dashboard-appointments";
import type { ServiceHour } from "@/lib/validations/vet-contact";
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

  // Soft-deleted pets — restorable, with their assessment history intact.
  const { data: deletedPets } = await supabase
    .from("pets")
    .select("pet_id, pet_name, species, breed")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  // Owner-level vet clinics + doctors (shared across all pets) and every pet's
  // appointments — both now live on the dashboard.
  const [{ data: vetRows }, { data: doctorRows }, { data: apptRows }] =
    await Promise.all([
      supabase
        .from("vet_contacts")
        .select(
          "vet_contact_id, clinic_name, phone, email, address, service_hours, notes",
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("vet_doctors")
        .select("doctor_id, vet_contact_id, name, specialty, phone, email, notes")
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("appointments")
        .select(
          "appointment_id, pet_id, title, scheduled_at, reason, notes, outcome, vet_contact_id, doctor_name",
        )
        .is("deleted_at", null)
        .order("scheduled_at", { ascending: true }),
    ]);

  const displayName = profile?.name ?? user?.email ?? "there";
  const hasPets = (pets?.length ?? 0) > 0;
  const hasDeletedPets = (deletedPets?.length ?? 0) > 0;

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

  // Only show appointments for active (non-deleted) pets, labelled with the name.
  const petNameById = new Map((pets ?? []).map((p) => [p.pet_id, p.pet_name]));
  const allAppointments: DashboardAppointment[] = (apptRows ?? [])
    .filter((a) => petNameById.has(a.pet_id))
    .map((a) => ({
      appointment_id: a.appointment_id,
      pet_id: a.pet_id,
      pet_name: petNameById.get(a.pet_id)!,
      title: a.title,
      scheduled_at: a.scheduled_at,
      reason: a.reason,
      notes: a.notes,
      outcome: a.outcome,
      vet_contact_id: a.vet_contact_id,
      doctor_name: a.doctor_name,
    }));
  const petOptions = (pets ?? []).map((p) => ({
    pet_id: p.pet_id,
    pet_name: p.pet_name,
  }));
  const clinicOptions = vetContacts.map((c) => ({
    vet_contact_id: c.vet_contact_id,
    clinic_name: c.clinic_name,
    doctors: c.doctors.map((d) => d.name).filter(Boolean),
  }));

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

      {/* Owner-level vet clinics + all appointments (shared across pets).
          Stacked (not side-by-side) so resizing one never distorts the other. */}
      <div className="grid gap-4">
        <VetContactsManager contacts={vetContacts} />
        <DashboardAppointments
          appointments={allAppointments}
          pets={petOptions}
          clinics={clinicOptions}
          nowIso={new Date().toISOString()}
        />
      </div>

      {hasDeletedPets && (
        <div className="grid gap-3">
          <div className="grid gap-1">
            <h2 className="font-heading text-lg font-semibold">
              Recently deleted
            </h2>
            <p className="text-sm text-muted-foreground">
              Restore a pet to bring back its profile and assessment history.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deletedPets!.map((pet) => (
              <DeletedPetCard key={pet.pet_id} pet={pet} />
            ))}
          </div>
        </div>
      )}

      {/* The assistant is always available — even with no pets it can help the
          owner create their first one. */}
      <DashboardChatWidget hasPets={hasPets} />
    </section>
  );
}
