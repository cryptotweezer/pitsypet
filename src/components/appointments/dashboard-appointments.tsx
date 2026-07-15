"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarClock,
  History as HistoryIcon,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Appointment enriched with which pet it belongs to (dashboard shows all pets').
export type DashboardAppointment = {
  appointment_id: string;
  pet_id: string;
  pet_name: string;
  pet_slug: string;
  title: string;
  scheduled_at: string;
  reason: string | null;
  notes: string | null;
  outcome: string | null;
  vet_contact_id: string | null;
  doctor_name: string | null;
};

export type PetOption = { pet_id: string; pet_name: string };
export type ClinicOption = {
  vet_contact_id: string;
  clinic_name: string | null;
  // The clinic's doctors, suggested in the form when it's selected.
  doctors: string[];
};

const EMPTY = {
  pet_id: "",
  title: "",
  scheduled_at: "",
  reason: "",
  notes: "",
  outcome: "",
  vet_contact_id: "",
  doctor_name: "",
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Deterministic English format — toLocaleString varies between the server's
// and the browser's ICU data ("Jul" vs "July"), which breaks SSR hydration.
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatWhen(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${h12}:${min} ${h >= 12 ? "pm" : "am"}`;
}

// All of the owner's appointments across every pet, with a pet picker on the
// add form. Per-pet pages keep their own (pre-scoped) appointments section.
export function DashboardAppointments({
  appointments,
  pets,
  clinics,
  nowIso,
}: {
  appointments: DashboardAppointment[];
  pets: PetOption[];
  clinics: ClinicOption[];
  // Server-provided "now" so the Next/Past split is stable across hydration.
  nowIso: string;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Edit/delete need the pet the appointment belongs to (route is pet-scoped).
  const [editingPetId, setEditingPetId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [pendingDelete, setPendingDelete] =
    useState<DashboardAppointment | null>(null);
  const [deleting, setDeleting] = useState(false);
  // View filter — "all" or a pet_id; narrows both upcoming and past lists.
  const [filterPetId, setFilterPetId] = useState("all");

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setEditingPetId("");
    setForm({ ...EMPTY, pet_id: pets[0]?.pet_id ?? "" });
    setAdding(true);
  }
  function openEdit(a: DashboardAppointment) {
    setAdding(false);
    setEditingPetId(a.pet_id);
    setForm({
      pet_id: a.pet_id,
      title: a.title ?? "",
      scheduled_at: toLocalInput(a.scheduled_at),
      reason: a.reason ?? "",
      notes: a.notes ?? "",
      outcome: a.outcome ?? "",
      vet_contact_id: a.vet_contact_id ?? "",
      doctor_name: a.doctor_name ?? "",
    });
    setEditingId(a.appointment_id);
  }
  function closeForm() {
    setAdding(false);
    setEditingId(null);
    setEditingPetId("");
    setForm(EMPTY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pet_id) {
      toast.error("Choose which pet this is for.");
      return;
    }
    if (!form.title.trim() || !form.scheduled_at) {
      toast.error("Add a title and a date & time.");
      return;
    }
    setSaving(true);
    // On edit, the route is scoped to the pet the appointment already belongs to.
    const petId = editingId ? editingPetId : form.pet_id;
    const { pet_id: _omit, ...payload } = form;
    void _omit;
    const url = editingId
      ? `/api/pets/${petId}/appointments/${editingId}`
      : `/api/pets/${petId}/appointments`;
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save appointment. Check the fields and try again.");
      return;
    }
    toast.success(`Appointment ${editingId ? "updated" : "added"}`);
    closeForm();
    router.refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(
      `/api/pets/${pendingDelete.pet_id}/appointments/${pendingDelete.appointment_id}`,
      { method: "DELETE" },
    );
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not remove appointment.");
      return;
    }
    toast.success("Appointment removed");
    setPendingDelete(null);
    router.refresh();
  }

  const clinicName = (id: string | null) =>
    clinics.find((c) => c.vet_contact_id === id)?.clinic_name ?? null;

  const nowMs = Date.parse(nowIso);
  // An outcome can only exist after the visit, so the field is only editable
  // once the form's date is in the past.
  const formIsPast =
    form.scheduled_at !== "" && Date.parse(form.scheduled_at) < nowMs;
  const visible =
    filterPetId === "all"
      ? appointments
      : appointments.filter((a) => a.pet_id === filterPetId);
  const upcoming = visible
    .filter((a) => Date.parse(a.scheduled_at) >= nowMs)
    .sort((a, b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at));
  const past = visible
    .filter((a) => Date.parse(a.scheduled_at) < nowMs)
    .sort((a, b) => Date.parse(b.scheduled_at) - Date.parse(a.scheduled_at));
  // Doctors of the clinic currently chosen in the form → datalist suggestions.
  const selectedClinicDoctors =
    clinics.find((c) => c.vet_contact_id === form.vet_contact_id)?.doctors ?? [];

  const formFields = (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="dappt-pet">Pet</Label>
          <select
            id="dappt-pet"
            value={form.pet_id}
            onChange={(e) => set("pet_id", e.target.value)}
            disabled={editingId !== null}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            required
          >
            <option value="" disabled>
              Choose a pet…
            </option>
            {pets.map((p) => (
              <option key={p.pet_id} value={p.pet_id}>
                {p.pet_name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dappt-title">Title</Label>
          <Input
            id="dappt-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Vaccination booster"
            required
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="dappt-when">Date & time</Label>
          <Input
            id="dappt-when"
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => set("scheduled_at", e.target.value)}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dappt-clinic">Clinic (optional)</Label>
          <select
            id="dappt-clinic"
            value={form.vet_contact_id}
            onChange={(e) => set("vet_contact_id", e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">— None —</option>
            {clinics.map((c) => (
              <option key={c.vet_contact_id} value={c.vet_contact_id}>
                {c.clinic_name ?? "Unnamed clinic"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="dappt-doctor">Doctor (optional)</Label>
        <Input
          id="dappt-doctor"
          list="dappt-doctor-options"
          value={form.doctor_name}
          onChange={(e) => set("doctor_name", e.target.value)}
          placeholder={
            form.vet_contact_id
              ? selectedClinicDoctors.length > 0
                ? "Pick a doctor or type a name"
                : "Type a doctor's name"
              : "Pick a clinic to see its doctors, or type a name"
          }
        />
        {selectedClinicDoctors.length > 0 && (
          <datalist id="dappt-doctor-options">
            {selectedClinicDoctors.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="dappt-reason">Reason</Label>
        <Input
          id="dappt-reason"
          value={form.reason}
          onChange={(e) => set("reason", e.target.value)}
          placeholder="Follow-up on skin condition"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="dappt-notes">Your notes / observations</Label>
        <Input
          id="dappt-notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="What you're seeing before the visit, questions to ask…"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="dappt-outcome">Vet&apos;s recommendations / outcome</Label>
        <Input
          id="dappt-outcome"
          value={form.outcome}
          onChange={(e) => set("outcome", e.target.value)}
          placeholder={
            formIsPast
              ? "What the vet said / advised"
              : "Available after the appointment has passed"
          }
          disabled={!formIsPast}
        />
        {!formIsPast && (
          <p className="text-xs text-muted-foreground">
            You can record the vet&apos;s outcome once this appointment date has
            passed.
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving
            ? "Saving…"
            : editingId
              ? "Save changes"
              : "Save appointment"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
          Cancel
        </Button>
      </div>
    </form>
  );

  const renderItem = (a: DashboardAppointment, isPast: boolean) =>
    editingId === a.appointment_id ? (
      <li key={a.appointment_id}>{formFields}</li>
    ) : (
      <li
        key={a.appointment_id}
        className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
      >
        <div className="grid gap-0.5">
          <Link
            href={`/pets/${a.pet_slug}`}
            className="font-semibold text-primary hover:underline"
          >
            {a.pet_name}
          </Link>
          <span className="font-medium">{a.title}</span>
          <span className="text-xs font-medium text-muted-foreground">
            {formatWhen(a.scheduled_at)}
          </span>
          {clinicName(a.vet_contact_id) && (
            <span className="text-xs text-muted-foreground">
              {clinicName(a.vet_contact_id)}
            </span>
          )}
          {a.doctor_name && (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium">Doctor:</span> {a.doctor_name}
            </span>
          )}
          {a.reason && (
            <span className="text-xs text-muted-foreground">{a.reason}</span>
          )}
          {a.notes && (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium">Notes:</span> {a.notes}
            </span>
          )}
          {a.outcome ? (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium">Vet outcome:</span> {a.outcome}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => openEdit(a)}
              className="w-fit text-xs font-medium text-primary hover:underline"
            >
              {isPast ? "+ Add what the vet said" : "+ Add visit info"}
            </button>
          )}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(a)}
            aria-label={`Edit ${a.title}`}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setPendingDelete(a)}
            aria-label={`Remove ${a.title}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </li>
    );

  return (
    <div className="grid gap-6">
      {/* Upcoming — nearest date first (sorted ascending above). */}
      <section className="grid gap-3 rounded-[2rem] border border-outline-variant/20 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-xl tracking-tight text-brand">
            <CalendarClock className="size-5" aria-hidden /> Appointments
          </h2>
          <div className="flex items-center gap-2">
            {pets.length > 0 && (
              <select
                value={filterPetId}
                onChange={(e) => setFilterPetId(e.target.value)}
                aria-label="Filter appointments by pet"
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All pets</option>
                {pets.map((p) => (
                  <option key={p.pet_id} value={p.pet_id}>
                    {p.pet_name}
                  </option>
                ))}
              </select>
            )}
            {!adding && (
              <Button variant="outline" size="sm" onClick={openAdd}>
                <Plus className="size-4" aria-hidden /> Add
              </Button>
            )}
          </div>
        </div>

        {upcoming.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">
            No upcoming appointments.
          </p>
        )}

        {upcoming.length > 0 && (
          <ul className="grid gap-2">
            {upcoming.map((a) => renderItem(a, false))}
          </ul>
        )}

        {adding &&
          (pets.length > 0 ? (
            formFields
          ) : (
            <div className="grid gap-2 rounded-lg border border-dashed p-4 text-center text-sm">
              <p className="font-medium">Add a pet first</p>
              <p className="text-muted-foreground">
                Appointments belong to a pet, so you&apos;ll need to create one
                before booking a visit.
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <Link
                  href="/dashboard/pets"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Add a pet
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeForm}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
      </section>

      {/* Past — its own card, most recent visit first. */}
      {past.length > 0 && (
        <section className="grid gap-3 rounded-[2rem] border border-outline-variant/20 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-xl tracking-tight text-brand">
            <HistoryIcon className="size-5" aria-hidden /> Past appointments
          </h2>
          <ul className="grid gap-2">{past.map((a) => renderItem(a, true))}</ul>
        </section>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this appointment?</DialogTitle>
            <DialogDescription>
              This removes {pendingDelete?.title} for {pendingDelete?.pet_name}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
