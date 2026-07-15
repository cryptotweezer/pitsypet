"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Stethoscope,
  Plus,
  Trash2,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Clock,
  UserRound,
  ChevronDown,
} from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { ServiceHour } from "@/lib/validations/vet-contact";

export type VetDoctor = {
  doctor_id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

export type VetContact = {
  vet_contact_id: string;
  clinic_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  service_hours: ServiceHour[];
  notes: string | null;
  doctors: VetDoctor[];
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];

type HoursState = Record<Day, { enabled: boolean; open: string; close: string }>;

function emptyHours(): HoursState {
  return DAYS.reduce((acc, d) => {
    acc[d] = { enabled: false, open: "09:00", close: "17:00" };
    return acc;
  }, {} as HoursState);
}

function hoursToState(hours: ServiceHour[]): HoursState {
  const state = emptyHours();
  for (const h of hours ?? []) {
    if (DAYS.includes(h.day as Day)) {
      state[h.day as Day] = { enabled: true, open: h.open, close: h.close };
    }
  }
  return state;
}

function stateToHours(state: HoursState): ServiceHour[] {
  return DAYS.filter((d) => state[d].enabled).map((d) => ({
    day: d,
    open: state[d].open,
    close: state[d].close,
  }));
}

// JS Date.getDay() is 0=Sun…6=Sat — map it onto our Mon-first labels.
const JS_DAY: Day[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isOpenAt(hours: ServiceHour[], when: Date): boolean {
  const today = JS_DAY[when.getDay()];
  const cur = when.getHours() * 60 + when.getMinutes();
  return (hours ?? []).some((h) => {
    if (h.day !== today) return false;
    const [oh, om] = h.open.split(":").map(Number);
    const [ch, cm] = h.close.split(":").map(Number);
    return cur >= oh * 60 + om && cur <= ch * 60 + cm;
  });
}

const EMPTY_CLINIC = {
  clinic_name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const EMPTY_DOCTOR = {
  name: "",
  specialty: "",
  phone: "",
  email: "",
  notes: "",
};

// Owner-level vet clinics + doctors (shared across all the owner's pets). Lives
// on the dashboard; the assistant can see and propose changes too.
export function VetContactsManager({ contacts }: { contacts: VetContact[] }) {
  const router = useRouter();

  // Clinic add/edit state.
  const [clinicOpen, setClinicOpen] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [clinicForm, setClinicForm] = useState(EMPTY_CLINIC);
  const [hours, setHours] = useState<HoursState>(emptyHours());

  // Doctor add/edit state.
  const [doctorClinicId, setDoctorClinicId] = useState<string | null>(null);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR);

  const [saving, setSaving] = useState(false);
  const [pendingDeleteClinic, setPendingDeleteClinic] =
    useState<VetContact | null>(null);
  const [pendingDeleteDoctor, setPendingDeleteDoctor] =
    useState<VetDoctor | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Hours dialog + live open/closed. "now" is computed client-side after mount
  // (and refreshed each minute) so the server render doesn't cause a hydration
  // mismatch.
  const [hoursDialogFor, setHoursDialogFor] = useState<VetContact | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  // Doctor lists collapse by default so many doctors don't bloat the card.
  const [expandedClinics, setExpandedClinics] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  function toggleExpanded(id: string) {
    setExpandedClinics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setClinic<K extends keyof typeof EMPTY_CLINIC>(
    key: K,
    value: string,
  ) {
    setClinicForm((f) => ({ ...f, [key]: value }));
  }
  function setDoctor<K extends keyof typeof EMPTY_DOCTOR>(
    key: K,
    value: string,
  ) {
    setDoctorForm((f) => ({ ...f, [key]: value }));
  }

  function openAddClinic() {
    setEditingClinicId(null);
    setClinicForm(EMPTY_CLINIC);
    setHours(emptyHours());
    setClinicOpen(true);
  }
  function openEditClinic(c: VetContact) {
    setEditingClinicId(c.vet_contact_id);
    setClinicForm({
      clinic_name: c.clinic_name ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      address: c.address ?? "",
      notes: c.notes ?? "",
    });
    setHours(hoursToState(c.service_hours));
    setClinicOpen(true);
  }
  function closeClinic() {
    setClinicOpen(false);
    setEditingClinicId(null);
    setClinicForm(EMPTY_CLINIC);
    setHours(emptyHours());
  }

  function openAddDoctor(clinicId: string) {
    setEditingDoctorId(null);
    setDoctorForm(EMPTY_DOCTOR);
    setDoctorClinicId(clinicId);
  }
  function openEditDoctor(clinicId: string, d: VetDoctor) {
    setEditingDoctorId(d.doctor_id);
    setDoctorForm({
      name: d.name ?? "",
      specialty: d.specialty ?? "",
      phone: d.phone ?? "",
      email: d.email ?? "",
      notes: d.notes ?? "",
    });
    setDoctorClinicId(clinicId);
  }
  function closeDoctor() {
    setDoctorClinicId(null);
    setEditingDoctorId(null);
    setDoctorForm(EMPTY_DOCTOR);
  }

  async function handleClinicSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clinicForm.clinic_name.trim()) {
      toast.error("Add a clinic name.");
      return;
    }
    setSaving(true);
    const payload = { ...clinicForm, service_hours: stateToHours(hours) };
    const url = editingClinicId
      ? `/api/vet-contacts/${editingClinicId}`
      : `/api/vet-contacts`;
    const res = await fetch(url, {
      method: editingClinicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save clinic. Check the fields and try again.");
      return;
    }
    toast.success(`Clinic ${editingClinicId ? "updated" : "added"}`);
    closeClinic();
    router.refresh();
  }

  async function handleDoctorSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctorForm.name.trim() || !doctorClinicId) {
      toast.error("Add a doctor name.");
      return;
    }
    setSaving(true);
    const base = `/api/vet-contacts/${doctorClinicId}/doctors`;
    const url = editingDoctorId ? `${base}/${editingDoctorId}` : base;
    const res = await fetch(url, {
      method: editingDoctorId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctorForm),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save doctor. Check the fields and try again.");
      return;
    }
    toast.success(`${doctorForm.name.trim()} ${editingDoctorId ? "updated" : "added"}`);
    closeDoctor();
    router.refresh();
  }

  async function handleDeleteClinic() {
    if (!pendingDeleteClinic) return;
    setDeleting(true);
    const res = await fetch(
      `/api/vet-contacts/${pendingDeleteClinic.vet_contact_id}`,
      { method: "DELETE" },
    );
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not remove clinic.");
      return;
    }
    toast.success("Clinic removed");
    setPendingDeleteClinic(null);
    router.refresh();
  }

  async function handleDeleteDoctor() {
    if (!pendingDeleteDoctor) return;
    // Find the doctor's clinic for the nested route.
    const clinic = contacts.find((c) =>
      c.doctors.some((d) => d.doctor_id === pendingDeleteDoctor.doctor_id),
    );
    if (!clinic) {
      setPendingDeleteDoctor(null);
      return;
    }
    setDeleting(true);
    const res = await fetch(
      `/api/vet-contacts/${clinic.vet_contact_id}/doctors/${pendingDeleteDoctor.doctor_id}`,
      { method: "DELETE" },
    );
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not remove doctor.");
      return;
    }
    toast.success("Doctor removed");
    setPendingDeleteDoctor(null);
    router.refresh();
  }

  const clinicForm_ui = (
    <form
      onSubmit={handleClinicSubmit}
      className="grid gap-3 rounded-lg border p-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="vet-clinic">Clinic name</Label>
          <Input
            id="vet-clinic"
            value={clinicForm.clinic_name}
            onChange={(e) => setClinic("clinic_name", e.target.value)}
            placeholder="Northside Vet Clinic"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="vet-phone">Phone</Label>
          <Input
            id="vet-phone"
            value={clinicForm.phone}
            onChange={(e) => setClinic("phone", e.target.value)}
            placeholder="(02) 1234 5678"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="vet-email">Email</Label>
          <Input
            id="vet-email"
            type="email"
            value={clinicForm.email}
            onChange={(e) => setClinic("email", e.target.value)}
            placeholder="clinic@example.com"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="vet-address">Address</Label>
          <Input
            id="vet-address"
            value={clinicForm.address}
            onChange={(e) => setClinic("address", e.target.value)}
            placeholder="12 Main St, Sydney"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Opening hours</Label>
        <div className="grid gap-1.5">
          {DAYS.map((d) => (
            <div key={d} className="flex flex-wrap items-center gap-2 text-sm">
              <label className="flex w-24 items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={hours[d].enabled}
                  onChange={(e) =>
                    setHours((h) => ({
                      ...h,
                      [d]: { ...h[d], enabled: e.target.checked },
                    }))
                  }
                />
                {d}
              </label>
              <Input
                type="time"
                value={hours[d].open}
                disabled={!hours[d].enabled}
                onChange={(e) =>
                  setHours((h) => ({
                    ...h,
                    [d]: { ...h[d], open: e.target.value },
                  }))
                }
                className="w-32"
                aria-label={`${d} open`}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="time"
                value={hours[d].close}
                disabled={!hours[d].enabled}
                onChange={(e) =>
                  setHours((h) => ({
                    ...h,
                    [d]: { ...h[d], close: e.target.value },
                  }))
                }
                className="w-32"
                aria-label={`${d} close`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="vet-notes">Notes</Label>
        <Input
          id="vet-notes"
          value={clinicForm.notes}
          onChange={(e) => setClinic("notes", e.target.value)}
          placeholder="Parking at rear; ask for triage nurse"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving
            ? "Saving…"
            : editingClinicId
              ? "Save changes"
              : "Save clinic"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={closeClinic}>
          Cancel
        </Button>
      </div>
    </form>
  );

  const doctorForm_ui = (
    <form
      onSubmit={handleDoctorSubmit}
      className="grid gap-3 rounded-lg border bg-muted/30 p-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="doc-name">Doctor name</Label>
          <Input
            id="doc-name"
            value={doctorForm.name}
            onChange={(e) => setDoctor("name", e.target.value)}
            placeholder="Dr. Smith"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="doc-specialty">Specialty</Label>
          <Input
            id="doc-specialty"
            value={doctorForm.specialty}
            onChange={(e) => setDoctor("specialty", e.target.value)}
            placeholder="Surgery, dermatology…"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="doc-phone">Phone (optional)</Label>
          <Input
            id="doc-phone"
            value={doctorForm.phone}
            onChange={(e) => setDoctor("phone", e.target.value)}
            placeholder="(02) 1234 5678"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="doc-email">Email (optional)</Label>
          <Input
            id="doc-email"
            type="email"
            value={doctorForm.email}
            onChange={(e) => setDoctor("email", e.target.value)}
            placeholder="dr@example.com"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="doc-notes">Notes</Label>
        <Input
          id="doc-notes"
          value={doctorForm.notes}
          onChange={(e) => setDoctor("notes", e.target.value)}
          placeholder="Usual vet; sees on Tuesdays"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : editingDoctorId ? "Save changes" : "Save doctor"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={closeDoctor}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="grid gap-6">
      {!clinicOpen && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openAddClinic}
            className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95"
          >
            <Plus className="size-4" aria-hidden /> Add clinic
          </button>
        </div>
      )}

      {contacts.length === 0 && !clinicOpen && (
        <p className="rounded-[2rem] border border-dashed border-outline-variant/50 py-10 text-center text-sm font-light text-on-surface-variant">
          No vet clinics yet.
        </p>
      )}

      {contacts.length > 0 && (
        <ul className="grid gap-6">
          {contacts.map((c) =>
            editingClinicId === c.vet_contact_id ? (
              <li
                key={c.vet_contact_id}
                className="rounded-[2rem] border border-outline-variant/20 bg-white p-6"
              >
                {clinicForm_ui}
              </li>
            ) : (
              // Each clinic is its own card, titled like the other sections.
              <li
                key={c.vet_contact_id}
                className="grid gap-3 rounded-[2rem] border border-outline-variant/20 bg-white p-6 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <h2 className="mb-1 flex items-center gap-2 font-display text-xl tracking-tight text-brand">
                      <Stethoscope className="size-5" aria-hidden />
                      {c.clinic_name}
                    </h2>
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
                    {c.address && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="size-3.5" aria-hidden /> {c.address}
                      </span>
                    )}
                    {c.service_hours.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setHoursDialogFor(c)}
                        className="flex w-fit items-center gap-1.5 text-muted-foreground hover:underline"
                      >
                        <Clock className="size-3.5" aria-hidden /> Hours
                        {now && (
                          <span
                            className={cn(
                              "font-medium",
                              isOpenAt(c.service_hours, now)
                                ? "text-green-600"
                                : "text-destructive",
                            )}
                          >
                            · {isOpenAt(c.service_hours, now) ? "Open now" : "Closed"}
                          </span>
                        )}
                      </button>
                    )}
                    {c.notes && (
                      <span className="text-xs text-muted-foreground">
                        {c.notes}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditClinic(c)}
                      aria-label={`Edit ${c.clinic_name ?? "clinic"}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setPendingDeleteClinic(c)}
                      aria-label="Remove clinic"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>

                {/* Doctors at this clinic */}
                <div className="grid gap-2 border-t pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(c.vet_contact_id)}
                      aria-expanded={
                        expandedClinics.has(c.vet_contact_id) ||
                        doctorClinicId === c.vet_contact_id
                      }
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:underline"
                    >
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform",
                          (expandedClinics.has(c.vet_contact_id) ||
                            doctorClinicId === c.vet_contact_id) &&
                            "rotate-180",
                        )}
                        aria-hidden
                      />
                      Doctors ({c.doctors.length})
                    </button>
                    {doctorClinicId !== c.vet_contact_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!expandedClinics.has(c.vet_contact_id))
                            toggleExpanded(c.vet_contact_id);
                          openAddDoctor(c.vet_contact_id);
                        }}
                      >
                        <Plus className="size-3.5" aria-hidden /> Add doctor
                      </Button>
                    )}
                  </div>

                  {(expandedClinics.has(c.vet_contact_id) ||
                    doctorClinicId === c.vet_contact_id) && (
                    <div className="grid gap-2">
                      {c.doctors.length === 0 &&
                        doctorClinicId !== c.vet_contact_id && (
                          <p className="text-xs text-muted-foreground">
                            No doctors added.
                          </p>
                        )}

                      {c.doctors.map((d) =>
                    doctorClinicId === c.vet_contact_id &&
                    editingDoctorId === d.doctor_id ? (
                      <div key={d.doctor_id}>{doctorForm_ui}</div>
                    ) : (
                      <div
                        key={d.doctor_id}
                        className="flex items-start justify-between gap-3 rounded-md bg-muted/40 px-2.5 py-1.5"
                      >
                        <div className="grid gap-0.5">
                          <span className="flex items-center gap-1.5 font-medium">
                            <UserRound className="size-3.5" aria-hidden />
                            {d.name}
                            {d.specialty && (
                              <span className="font-normal text-muted-foreground">
                                · {d.specialty}
                              </span>
                            )}
                          </span>
                          {d.phone && (
                            <a
                              href={`tel:${d.phone.replace(/[^\d+]/g, "")}`}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:underline"
                            >
                              <Phone className="size-3" aria-hidden /> {d.phone}
                            </a>
                          )}
                          {d.email && (
                            <a
                              href={`mailto:${d.email}`}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:underline"
                            >
                              <Mail className="size-3" aria-hidden /> {d.email}
                            </a>
                          )}
                          {d.notes && (
                            <span className="text-xs text-muted-foreground">
                              {d.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDoctor(c.vet_contact_id, d)}
                            aria-label={`Edit ${d.name}`}
                          >
                            <Pencil className="size-3.5" aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setPendingDeleteDoctor(d)}
                            aria-label={`Remove ${d.name}`}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}

                      {doctorClinicId === c.vet_contact_id &&
                        editingDoctorId === null &&
                        doctorForm_ui}
                    </div>
                  )}
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {clinicOpen && editingClinicId === null && (
        <div className="grid gap-3 rounded-[2rem] border border-outline-variant/20 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-xl tracking-tight text-brand">
            <Stethoscope className="size-5" aria-hidden /> New clinic
          </h2>
          {clinicForm_ui}
        </div>
      )}

      <Dialog
        open={pendingDeleteClinic !== null}
        onOpenChange={(open) => !open && setPendingDeleteClinic(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Remove {pendingDeleteClinic?.clinic_name ?? "this clinic"}?
            </DialogTitle>
            <DialogDescription>
              This removes the clinic and all its doctors. You can add it again
              later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteClinic}
              disabled={deleting}
            >
              {deleting ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDeleteDoctor !== null}
        onOpenChange={(open) => !open && setPendingDeleteDoctor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Remove {pendingDeleteDoctor?.name ?? "this doctor"}?
            </DialogTitle>
            <DialogDescription>
              This removes the doctor from the clinic. You can add them again
              later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteDoctor}
              disabled={deleting}
            >
              {deleting ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={hoursDialogFor !== null}
        onOpenChange={(open) => !open && setHoursDialogFor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hoursDialogFor?.clinic_name ?? "Opening hours"}
            </DialogTitle>
            <DialogDescription>
              {hoursDialogFor && now
                ? isOpenAt(hoursDialogFor.service_hours, now)
                  ? "Open now"
                  : "Closed now"
                : "Weekly opening hours"}
            </DialogDescription>
          </DialogHeader>
          <ul className="grid gap-1 text-sm">
            {DAYS.map((d) => {
              const h = hoursDialogFor?.service_hours.find((x) => x.day === d);
              const isToday = now ? JS_DAY[now.getDay()] === d : false;
              return (
                <li
                  key={d}
                  className={cn(
                    "flex justify-between rounded px-2 py-1",
                    isToday && "bg-muted font-medium",
                  )}
                >
                  <span>{d}</span>
                  <span className="text-muted-foreground">
                    {h ? `${h.open} – ${h.close}` : "Closed"}
                  </span>
                </li>
              );
            })}
          </ul>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
