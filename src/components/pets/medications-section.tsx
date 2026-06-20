"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pill, Plus, Trash2 } from "lucide-react";

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

export function MedicationsSection({
  petId,
  medications,
}: {
  petId: string;
  medications: Medication[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length === 0) return;
    setSaving(true);
    // Indefinite course → no end date and stays active.
    const payload = {
      ...form,
      ended_at: indefinite ? "" : form.ended_at,
      active: indefinite ? true : form.ended_at.length === 0,
    };
    const res = await fetch(`/api/pets/${petId}/medications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not add medication. Check the fields and try again.");
      return;
    }
    toast.success(`${form.name.trim()} added`);
    resetForm();
    setAdding(false);
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

  return (
    <section className="grid gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Pill className="size-5" aria-hidden /> Medications
        </h2>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
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
        <ul className="grid gap-2">
          {medications.map((m) => (
            <li
              key={m.medication_id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div className="grid gap-0.5">
                <span className="font-medium">{m.name}</span>
                <span className="text-muted-foreground">
                  {[m.dosage, m.frequency, m.quantity]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </span>
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
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setPendingDelete(m)}
                aria-label={`Remove ${m.name}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="grid gap-3 rounded-lg border p-3">
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
              value={form.prescribed_by}
              onChange={(e) => set("prescribed_by", e.target.value)}
              placeholder="Dr. Smith"
            />
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
              {saving ? "Saving…" : "Save medication"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

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
