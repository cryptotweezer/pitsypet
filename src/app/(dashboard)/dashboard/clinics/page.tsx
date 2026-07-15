import { createClient } from "@/lib/supabase/server";
import {
  VetContactsManager,
  type VetContact,
  type VetDoctor,
} from "@/components/vet/vet-contacts-manager";
import type { ServiceHour } from "@/lib/validations/vet-contact";

export const metadata = { title: "Vet clinics · PitsyPet" };

export default async function DashboardClinicsPage() {
  const supabase = await createClient();

  // Owner-level vet clinics + doctors (shared across all pets).
  const [{ data: vetRows }, { data: doctorRows }] = await Promise.all([
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
  ]);

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

  return (
    <section className="grid gap-6">
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          VET CLINICS
        </span>
        <h1 className="font-display text-3xl tracking-tight text-brand">
          Your clinics
        </h1>
        <p className="font-light text-on-surface-variant">
          The clinics and doctors you work with, shared across all your pets —
          contact details, opening hours, and whether they&apos;re open right
          now.
        </p>
      </div>
      <VetContactsManager contacts={vetContacts} />
    </section>
  );
}
