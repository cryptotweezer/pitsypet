"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pill, Plus, Trash2, Pencil, ChevronDown, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isMedicationActive } from "@/lib/medications";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Medication = {
  medication_id: string;
  name: string;
  dosage: string | null;
  dosage_unit: string | null;
  quantity: string | null;
  frequency: string | null;
  prescribed_by: string | null;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  active: boolean;
};

// Common dosage units offered as suggestions. The field stays free-text (the
// real set is open-ended), so anything can be typed if it's not listed.
const DOSAGE_UNITS = [
  "mg",
  "ml",
  "mcg",
  "g",
  "IU",
  "mg/kg",
  "mg/ml",
  "tablet",
  "capsule",
  "drop",
  "puff",
  "sachet",
  "%",
];

const EMPTY = {
  name: "",
  dosage: "",
  dosage_unit: "",
  quantity: "",
  frequency: "",
  prescribed_by: "",
  started_at: "",
  ended_at: "",
  notes: "",
};

function toForm(m: Medication) {
  return {
    name: m.name ?? "",
    dosage: m.dosage ?? "",
    dosage_unit: m.dosage_unit ?? "",
    quantity: m.quantity ?? "",
    frequency: m.frequency ?? "",
    prescribed_by: m.prescribed_by ?? "",
    started_at: m.started_at ?? "",
    ended_at: m.ended_at ?? "",
    notes: m.notes ?? "",
  };
}

// Combine the amount and its unit for display, e.g. "1.5" + "mg" → "1.5 mg".
function formatDosage(m: Pick<Medication, "dosage" | "dosage_unit">): string {
  return [m.dosage, m.dosage_unit].filter(Boolean).join(" ");
}

export type ClinicOption = {
  vet_contact_id: string;
  clinic_name: string | null;
  doctors: string[];
};

export function MedicationsSection({
  petId,
  medications,
  doctorOptions = [],
  clinics = [],
}: {
  petId: string;
  medications: Medication[];
  doctorOptions?: string[];
  // Owner's vet clinics (with their doctors) — drive the "Prescribed by"
  // clinic→doctor pickers. Optional: when empty, the free-text field is used.
  clinics?: ClinicOption[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  // null = not editing; a string id = that medication's inline form is open.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  // Most medications run until a vet says otherwise, so default to indefinite.
  const [indefinite, setIndefinite] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Medication | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Finished medications are history — collapsed by default.
  const [showFinished, setShowFinished] = useState(false);
  const [finishingId, setFinishingId] = useState<string | null>(null);
  // "Prescribed by" = clinic, plus a Doctor — two independent combobox fields.
  // Each can be picked from the saved list OR typed freely (e.g. a clinic not on
  // file). They are composed into the stored `prescribed_by` only on save; no
  // live "composed" preview is shown. Stored format: "Doctor — Clinic".
  const [pbClinic, setPbClinic] = useState("");
  const [pbDoctor, setPbDoctor] = useState("");
  // Doctor suggestions follow the chosen clinic when it matches a saved one;
  // otherwise fall back to every known doctor so free typing still gets hints.
  const matchedClinic = clinics.find(
    (c) => (c.clinic_name ?? "").toLowerCase() === pbClinic.trim().toLowerCase(),
  );
  const pbDoctorSuggestions =
    matchedClinic && matchedClinic.doctors.length > 0
      ? matchedClinic.doctors
      : doctorOptions;

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Split a stored "Doctor — Clinic" value back into the two fields. A single
  // token (no separator) is treated as a clinic if it matches a saved clinic
  // name, else as a doctor — so edits repopulate the right boxes.
  function splitPrescriber(value: string | null): { doctor: string; clinic: string } {
    const v = (value ?? "").trim();
    if (!v) return { doctor: "", clinic: "" };
    const parts = v.split(" — ");
    if (parts.length >= 2) {
      return { doctor: parts[0].trim(), clinic: parts.slice(1).join(" — ").trim() };
    }
    const isClinic = clinics.some(
      (c) => (c.clinic_name ?? "").toLowerCase() === v.toLowerCase(),
    );
    return isClinic ? { doctor: "", clinic: v } : { doctor: v, clinic: "" };
  }

  function resetForm() {
    setForm(EMPTY);
    setIndefinite(true);
    setPbClinic("");
    setPbDoctor("");
  }

  function openAdd() {
    setEditingId(null);
    resetForm();
    setAdding(true);
  }

  function openEdit(m: Medication) {
    setAdding(false);
    setForm(toForm(m));
    setIndefinite(!m.ended_at);
    const { doctor, clinic } = splitPrescriber(m.prescribed_by);
    setPbDoctor(doctor);
    setPbClinic(clinic);
    setEditingId(m.medication_id);
  }

  function closeForm() {
    setAdding(false);
    setEditingId(null);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length === 0) return;
    // Start date is required — a medication record needs to say when it began.
    if (form.started_at.trim().length === 0) {
      toast.error("Please choose a start date.");
      return;
    }
    if (
      !indefinite &&
      form.started_at &&
      form.ended_at &&
      form.ended_at < form.started_at
    ) {
      toast.error("End date can't be before the start date.");
      return;
    }
    setSaving(true);
    // Compose "Doctor — Clinic" (either part optional) for storage.
    const prescribed_by = [pbDoctor.trim(), pbClinic.trim()]
      .filter(Boolean)
      .join(" — ");
    // Indefinite course → no end date and stays active. A fixed course stays
    // active until its end date passes, so a future end date is still active.
    const payload = {
      ...form,
      prescribed_by,
      ended_at: indefinite ? "" : form.ended_at,
      active: indefinite ? true : isMedicationActive(form.ended_at || null),
    };
    const url = editingId
      ? `/api/pets/${petId}/medications/${editingId}`
      : `/api/pets/${petId}/medications`;
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save medication. Check the fields and try again.");
      return;
    }
    toast.success(`${form.name.trim()} ${editingId ? "updated" : "added"}`);
    closeForm();
    router.refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(
      `/api/pets/${petId}/medications/${pendingDelete.medication_id}`,
      { method: "DELETE" },
    );
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not remove medication.");
      return;
    }
    toast.success(`${pendingDelete.name} removed`);
    setPendingDelete(null);
    router.refresh();
  }

  // Mark an ongoing medication as finished today: set its end date to today and
  // clear the active flag, which moves it into the "Finished" section.
  async function markFinished(m: Medication) {
    const today = new Date().toISOString().slice(0, 10);
    setFinishingId(m.medication_id);
    const res = await fetch(
      `/api/pets/${petId}/medications/${m.medication_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ended_at: today, active: false }),
      },
    );
    setFinishingId(null);
    if (!res.ok) {
      toast.error("Could not update medication.");
      return;
    }
    toast.success(`${m.name} marked as finished`);
    router.refresh();
  }

  const formFields = (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-outline-variant/30 p-3">
      <div className="grid gap-1.5">
        <Label htmlFor="med-name">Name</Label>
        <Input
          id="med-name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Metacam"
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="med-dosage">Dose amount</Label>
          <Input
            id="med-dosage"
            value={form.dosage}
            onChange={(e) => set("dosage", e.target.value)}
            placeholder="1.5"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="med-dosage-unit">Unit</Label>
          <Input
            id="med-dosage-unit"
            list="med-dosage-units"
            value={form.dosage_unit}
            onChange={(e) => set("dosage_unit", e.target.value)}
            placeholder="mg"
          />
          <datalist id="med-dosage-units">
            {DOSAGE_UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="med-quantity">Quantity</Label>
          <Input
            id="med-quantity"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            placeholder="1 tablet"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="med-frequency">Frequency</Label>
          <Input
            id="med-frequency"
            value={form.frequency}
            onChange={(e) => set("frequency", e.target.value)}
            placeholder="Twice daily"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="med-clinic">Prescribed by (clinic)</Label>
          <Input
            id="med-clinic"
            list="med-clinic-options"
            value={pbClinic}
            onChange={(e) => setPbClinic(e.target.value)}
            placeholder="Pick a clinic or type one"
          />
          {clinics.length > 0 && (
            <datalist id="med-clinic-options">
              {clinics.map((c) => (
                <option key={c.vet_contact_id} value={c.clinic_name ?? ""} />
              ))}
            </datalist>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="med-doctor">Doctor</Label>
          <Input
            id="med-doctor"
            list="med-doctor-options"
            value={pbDoctor}
            onChange={(e) => setPbDoctor(e.target.value)}
            placeholder="Pick a doctor or type one"
          />
          {pbDoctorSuggestions.length > 0 && (
            <datalist id="med-doctor-options">
              {pbDoctorSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="med-started">Start date *</Label>
          <Input
            id="med-started"
            type="date"
            required
            value={form.started_at}
            onChange={(e) => set("started_at", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="med-ended">End date</Label>
          <Input
            id="med-ended"
            type="date"
            value={form.ended_at}
            onChange={(e) => set("ended_at", e.target.value)}
            disabled={indefinite}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="size-4"
          checked={indefinite}
          onChange={(e) => setIndefinite(e.target.checked)}
        />
        Ongoing / indefinite (no end date)
      </label>
      <div className="grid gap-1.5">
        <Label htmlFor="med-notes">Notes</Label>
        <Input
          id="med-notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Give with food"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : editingId ? "Save changes" : "Save medication"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
          Cancel
        </Button>
      </div>
    </form>
  );

  // Current vs finished. A med is current only if its end date hasn't passed
  // (catches a future end date silently lapsing) AND it wasn't explicitly
  // finished. "Mark as finished" sets end date = today and active = false; since
  // a med ending *today* still counts as active by date, we must also honour the
  // explicit active=false flag, or a just-finished med would stay in the current
  // list with the button still showing.
  const isCurrent = (m: Medication) =>
    isMedicationActive(m.ended_at) && m.active !== false;
  const active = medications.filter(isCurrent);
  const finished = medications.filter((m) => !isCurrent(m));

  const renderMed = (m: Medication, isFinished: boolean) =>
    editingId === m.medication_id ? (
      <li key={m.medication_id} className="sm:col-span-2">
        {formFields}
      </li>
    ) : (
      <li
        key={m.medication_id}
        className="flex items-start justify-between gap-3 rounded-2xl border border-outline-variant/30 p-3 text-sm"
      >
        <div className="grid gap-1">
          <span className="font-medium">{m.name}</span>
          {(m.dosage || m.quantity || m.frequency) && (
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {m.dosage && (
                <span>
                  <span className="font-medium">Dosage:</span>{" "}
                  {formatDosage(m)}
                </span>
              )}
              {m.quantity && (
                <span>
                  <span className="font-medium">Quantity:</span> {m.quantity}
                </span>
              )}
              {m.frequency && (
                <span>
                  <span className="font-medium">Frequency:</span> {m.frequency}
                </span>
              )}
            </div>
          )}
          {(m.started_at || m.ended_at) && (
            <span className="text-xs text-muted-foreground">
              {m.started_at ? `From ${m.started_at}` : ""}
              {m.ended_at
                ? ` to ${m.ended_at}`
                : m.started_at
                  ? " · ongoing"
                  : ""}
            </span>
          )}
          {m.prescribed_by && (
            <span className="text-xs text-muted-foreground">
              Prescribed by {m.prescribed_by}
            </span>
          )}
          {m.notes && (
            <span className="text-xs text-muted-foreground">{m.notes}</span>
          )}
          {!isFinished ? (
            <button
              type="button"
              onClick={() => markFinished(m)}
              disabled={finishingId === m.medication_id}
              className="flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              <CheckCircle2 className="size-3.5" aria-hidden />
              {finishingId === m.medication_id
                ? "Saving…"
                : "Mark as finished"}
            </button>
          ) : (
            <span className="flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="size-3.5" aria-hidden />
              Finished
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(m)}
            aria-label={`Edit ${m.name}`}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setPendingDelete(m)}
            aria-label={`Remove ${m.name}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </li>
    );

  return (
    <section className="grid gap-3 rounded-[2rem] border border-outline-variant/20 bg-white p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-xl tracking-tight text-brand">
          <Pill className="size-5" aria-hidden /> Medications
        </h2>
        {!adding && (
          <Button variant="outline" size="sm" onClick={openAdd}>
            <Plus className="size-4" aria-hidden /> Add
          </Button>
        )}
      </div>

      {medications.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          No medications recorded yet.
        </p>
      )}

      {active.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {active.map((m) => renderMed(m, false))}
        </ul>
      )}

      {finished.length > 0 && (
        <div className="grid gap-2 border-t pt-3">
          <button
            type="button"
            onClick={() => setShowFinished((v) => !v)}
            aria-expanded={showFinished}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                showFinished && "rotate-180",
              )}
              aria-hidden
            />
            Finished medications ({finished.length})
          </button>
          {showFinished && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {finished.map((m) => renderMed(m, true))}
            </ul>
          )}
        </div>
      )}

      {adding && formFields}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {pendingDelete?.name}?</DialogTitle>
            <DialogDescription>
              This removes {pendingDelete?.name} from this pet&apos;s
              medications. You can add it again later.
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
