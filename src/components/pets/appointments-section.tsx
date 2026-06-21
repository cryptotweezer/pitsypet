"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Plus, Trash2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Appointment = {
  appointment_id: string;
  title: string;
  scheduled_at: string;
  reason: string | null;
  notes: string | null;
  outcome: string | null;
  vet_contact_id: string | null;
};

export type ClinicOption = { vet_contact_id: string; clinic_name: string | null };

const EMPTY = {
  title: "",
  scheduled_at: "",
  reason: "",
  notes: "",
  outcome: "",
  vet_contact_id: "",
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppointmentsSection({
  petId,
  appointments,
  clinics,
  nowIso,
}: {
  petId: string;
  appointments: Appointment[];
  clinics: ClinicOption[];
  // Server-provided "now" so the Next/Past split is stable across hydration.
  nowIso: string;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setAdding(true);
  }
  function openEdit(a: Appointment) {
    setAdding(false);
    setForm({
      title: a.title ?? "",
      scheduled_at: toLocalInput(a.scheduled_at),
      reason: a.reason ?? "",
      notes: a.notes ?? "",
      outcome: a.outcome ?? "",
      vet_contact_id: a.vet_contact_id ?? "",
    });
    setEditingId(a.appointment_id);
  }
  function closeForm() {
    setAdding(false);
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduled_at) {
      toast.error("Add a title and a date & time.");
      return;
    }
    setSaving(true);
    const url = editingId
      ? `/api/pets/${petId}/appointments/${editingId}`
      : `/api/pets/${petId}/appointments`;
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
      `/api/pets/${petId}/appointments/${pendingDelete.appointment_id}`,
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
  const upcoming = appointments
    .filter((a) => Date.parse(a.scheduled_at) >= nowMs)
    .sort((a, b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at));
  const past = appointments
    .filter((a) => Date.parse(a.scheduled_at) < nowMs)
    .sort((a, b) => Date.parse(b.scheduled_at) - Date.parse(a.scheduled_at));

  const formFields = (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-3">
      <div className="grid gap-1.5">
        <Label htmlFor="appt-title">Title</Label>
        <Input
          id="appt-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Vaccination booster"
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="appt-when">Date & time</Label>
          <Input
            id="appt-when"
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => set("scheduled_at", e.target.value)}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="appt-clinic">Clinic (optional)</Label>
          <select
            id="appt-clinic"
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
        <Label htmlFor="appt-reason">Reason</Label>
        <Input
          id="appt-reason"
          value={form.reason}
          onChange={(e) => set("reason", e.target.value)}
          placeholder="Follow-up on skin condition"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="appt-notes">Your notes / observations</Label>
        <Input
          id="appt-notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="What you're seeing before the visit, questions to ask…"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="appt-outcome">Vet&apos;s recommendations / outcome</Label>
        <Input
          id="appt-outcome"
          value={form.outcome}
          onChange={(e) => set("outcome", e.target.value)}
          placeholder="What the vet said / advised (add after the visit)"
        />
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

  const renderItem = (a: Appointment, isPast: boolean) =>
    editingId === a.appointment_id ? (
      <li key={a.appointment_id}>{formFields}</li>
    ) : (
      <li
        key={a.appointment_id}
        className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
      >
        <div className="grid gap-0.5">
          <span className="font-medium">{a.title}</span>
          <span className="text-xs font-medium text-muted-foreground">
            {formatWhen(a.scheduled_at)}
          </span>
          {clinicName(a.vet_contact_id) && (
            <span className="text-xs text-muted-foreground">
              {clinicName(a.vet_contact_id)}
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
    <section className="grid gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <CalendarClock className="size-5" aria-hidden /> Next appointments
        </h2>
        {!adding && (
          <Button variant="outline" size="sm" onClick={openAdd}>
            <Plus className="size-4" aria-hidden /> Add
          </Button>
        )}
      </div>

      {upcoming.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
      )}

      {upcoming.length > 0 && (
        <ul className="grid gap-2">{upcoming.map((a) => renderItem(a, false))}</ul>
      )}

      {adding && formFields}

      {past.length > 0 && (
        <div className="grid gap-2 border-t pt-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Past appointments
          </h3>
          <ul className="grid gap-2">{past.map((a) => renderItem(a, true))}</ul>
        </div>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this appointment?</DialogTitle>
            <DialogDescription>
              This removes {pendingDelete?.title} from the pet&apos;s
              appointments.
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
    </section>
  );
}
