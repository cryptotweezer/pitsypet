"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Stethoscope, Plus, Trash2, Phone, Mail } from "lucide-react";

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

export type VetContact = {
  vet_contact_id: string;
  doctor_name: string | null;
  clinic_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

const EMPTY = {
  doctor_name: "",
  clinic_name: "",
  phone: "",
  email: "",
  notes: "",
};

export function VetContactsSection({
  petId,
  contacts,
}: {
  petId: string;
  contacts: VetContact[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [pendingDelete, setPendingDelete] = useState<VetContact | null>(null);
  const [deleting, setDeleting] = useState(false);

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.doctor_name.trim() && !form.clinic_name.trim()) {
      toast.error("Add at least a doctor or clinic name.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/pets/${petId}/vet-contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not add vet contact. Check the fields and try again.");
      return;
    }
    toast.success("Vet contact added");
    setForm(EMPTY);
    setAdding(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(
      `/api/pets/${petId}/vet-contacts/${pendingDelete.vet_contact_id}`,
      { method: "DELETE" },
    );
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not remove vet contact.");
      return;
    }
    toast.success("Vet contact removed");
    setPendingDelete(null);
    router.refresh();
  }

  const pendingLabel =
    pendingDelete?.doctor_name ?? pendingDelete?.clinic_name ?? "this contact";

  return (
    <section className="grid gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Stethoscope className="size-5" aria-hidden /> Veterinarian
        </h2>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden /> Add
          </Button>
        )}
      </div>

      {contacts.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">No vet contacts yet.</p>
      )}

      {contacts.length > 0 && (
        <ul className="grid gap-2">
          {contacts.map((c) => (
            <li
              key={c.vet_contact_id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div className="grid gap-0.5">
                <span className="font-medium">
                  {c.doctor_name ?? c.clinic_name}
                </span>
                {c.doctor_name && c.clinic_name && (
                  <span className="text-muted-foreground">{c.clinic_name}</span>
                )}
                {c.phone && (
                  <a
                    href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:underline"
                  >
                    <Phone className="size-3.5" aria-hidden /> {c.phone}
                  </a>
                )}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:underline"
                  >
                    <Mail className="size-3.5" aria-hidden /> {c.email}
                  </a>
                )}
                {c.notes && (
                  <span className="text-xs text-muted-foreground">{c.notes}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setPendingDelete(c)}
                aria-label="Remove vet contact"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="grid gap-3 rounded-lg border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="vet-doctor">Doctor name</Label>
              <Input
                id="vet-doctor"
                value={form.doctor_name}
                onChange={(e) => set("doctor_name", e.target.value)}
                placeholder="Dr. Smith"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vet-clinic">Clinic name</Label>
              <Input
                id="vet-clinic"
                value={form.clinic_name}
                onChange={(e) => set("clinic_name", e.target.value)}
                placeholder="Northside Vet Clinic"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="vet-phone">Phone</Label>
              <Input
                id="vet-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(02) 1234 5678"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vet-email">Email</Label>
              <Input
                id="vet-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="clinic@example.com"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vet-notes">Notes</Label>
            <Input
              id="vet-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Open Mon–Sat"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving…" : "Save contact"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setForm(EMPTY);
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
            <DialogTitle>Remove {pendingLabel}?</DialogTitle>
            <DialogDescription>
              This removes this vet contact from the pet&apos;s record. You can
              add it again later.
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
