import { createClient } from "@/lib/supabase/server";
import {
  DashboardAppointments,
  type DashboardAppointment,
} from "@/components/appointments/dashboard-appointments";

export const metadata = { title: "Appointments · PitsyPet" };

export default async function DashboardAppointmentsPage() {
  const supabase = await createClient();

  const [{ data: pets }, { data: vetRows }, { data: doctorRows }, { data: apptRows }] =
    await Promise.all([
      supabase
        .from("pets")
        .select("pet_id, pet_name, slug")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("vet_contacts")
        .select("vet_contact_id, clinic_name")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("vet_doctors")
        .select("vet_contact_id, name")
        .is("deleted_at", null),
      supabase
        .from("appointments")
        .select(
          "appointment_id, pet_id, title, scheduled_at, reason, notes, outcome, vet_contact_id, doctor_name",
        )
        .is("deleted_at", null)
        .order("scheduled_at", { ascending: true }),
    ]);

  // Only show appointments for active (non-deleted) pets, labelled with the name.
  const petById = new Map(
    (pets ?? []).map((p) => [p.pet_id, { name: p.pet_name, slug: p.slug }]),
  );
  const allAppointments: DashboardAppointment[] = (apptRows ?? [])
    .filter((a) => petById.has(a.pet_id))
    .map((a) => ({
      appointment_id: a.appointment_id,
      pet_id: a.pet_id,
      pet_name: petById.get(a.pet_id)!.name,
      pet_slug: petById.get(a.pet_id)!.slug,
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

  // Group doctor names under their clinic for the form's datalist.
  const doctorsByClinic = new Map<string, string[]>();
  for (const d of doctorRows ?? []) {
    if (!d.vet_contact_id || !d.name) continue;
    const list = doctorsByClinic.get(d.vet_contact_id) ?? [];
    list.push(d.name);
    doctorsByClinic.set(d.vet_contact_id, list);
  }
  const clinicOptions = (vetRows ?? []).map((c) => ({
    vet_contact_id: c.vet_contact_id,
    clinic_name: c.clinic_name,
    doctors: doctorsByClinic.get(c.vet_contact_id) ?? [],
  }));

  return (
    <section className="grid gap-6">
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          APPOINTMENTS
        </span>
        <h1 className="font-display text-3xl tracking-tight text-brand">
          All appointments
        </h1>
        <p className="font-light text-on-surface-variant">
          Upcoming and past visits for every pet — filter by pet, or book a new
          appointment at one of your clinics.
        </p>
      </div>
      <DashboardAppointments
        appointments={allAppointments}
        pets={petOptions}
        clinics={clinicOptions}
        nowIso={new Date().toISOString()}
      />
    </section>
  );
}
