"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pill, Plus, Trash2, Pencil } from "lucide-react";

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

export type Medication = {
  medication_id: string;
  name: string;
  dosage: string | null;
  quantity: string | null;
  frequency: string | null;
  prescribed_by: string | null;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  active: boolean;
};

const EMPTY = {
  name: "",
  dosage: "",
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
    quantity: m.quantity ?? "",
    frequency: m.frequency ?? "",
    prescribed_by: m.prescribed_by ?? "",
    started_at: m.started_at ?? "",
    ended_at: m.ended_at ?? "",
    notes: m.notes ?? "",
  };
}

export function MedicationsSection({
  petId,
  medications,
  doctorOptions = [],
}: {
  petId: string;
  medications: Medication[];
  doctorOptions?: string[];
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

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY);
    setIndefinite(true);
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
    // Indefinite course → no end date and stays active.
    const payload = {
      ...form,
      ended_at: indefinite ? "" : form.ended_at,
      active: indefinite ? true : form.ended_at.length === 0,
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

  const formFields = (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-3">
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
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="med-dosage">Dosage</Label>
          <Input
            id="med-dosage"
            value={form.dosage}
            onChange={(e) => set("dosage", e.target.value)}
            placeholder="1.5 mg"
          />
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
      <div className="grid gap-1.5">
        <Label htmlFor="med-by">Prescribed by</Label>
        <Input
          id="med-by"
          list="med-doctor-options"
          value={form.prescribed_by}
          onChange={(e) => set("prescribed_by", e.target.value)}
          placeholder="Pick a saved doctor or type a name"
        />
        {doctorOptions.length > 0 && (
          <datalist id="med-doctor-options">
            {doctorOptions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="med-started">Start date</Label>
          <Input
            id="med-started"
            type="date"
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

  return (
    <section className="grid gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
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

      {medications.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {medications.map((m) =>
            editingId === m.medication_id ? (
              <li key={m.medication_id} className="sm:col-span-2">
                {formFields}
              </li>
            ) : (
              <li
                key={m.medication_id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
              >
                <div className="grid gap-1">
                  <span className="font-medium">{m.name}</span>
                  {(m.dosage || m.quantity || m.frequency) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      {m.dosage && (
                        <span>
                          <span className="font-medium">Dosage:</span> {m.dosage}
                        </span>
                      )}
                      {m.quantity && (
                        <span>
                          <span className="font-medium">Quantity:</span>{" "}
                          {m.quantity}
                        </span>
                      )}
                      {m.frequency && (
                        <span>
                          <span className="font-medium">Frequency:</span>{" "}
                          {m.frequency}
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
                    <span className="text-xs text-muted-foreground">
                      {m.notes}
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
            ),
          )}
        </ul>
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
