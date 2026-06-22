"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  Plus,
  Trash2,
  Pencil,
  Check,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

export type ActiveSymptom = {
  symptom_id: string;
  name: string;
  severity: string | null;
  status: string;
  detected_at: string;
  resolved_at: string | null;
  notes: string | null;
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  improving: "secondary",
  worsened: "destructive",
  resolved: "outline",
};

const SEVERITY_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  severe: "destructive",
  moderate: "default",
  mild: "secondary",
  unknown: "outline",
};

const EMPTY = {
  name: "",
  severity: "unknown",
  detected_at: "",
  notes: "",
};

export function ActiveSymptomsSection({
  petId,
  symptoms,
}: {
  petId: string;
  symptoms: ActiveSymptom[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ActiveSymptom | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  // Resolved symptoms drop out of the active panel into a collapsible history
  // section, so "Active symptoms" only shows what the pet is currently dealing
  // with (active / improving / worsened).
  const active = symptoms.filter((s) => s.status !== "resolved");
  const resolved = symptoms.filter((s) => s.status === "resolved");

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setAdding(true);
  }
  function openEdit(s: ActiveSymptom) {
    setAdding(false);
    setForm({
      name: s.name ?? "",
      severity: s.severity ?? "unknown",
      detected_at: s.detected_at ?? "",
      notes: s.notes ?? "",
    });
    setEditingId(s.symptom_id);
  }
  function closeForm() {
    setAdding(false);
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length === 0) return;
    setSaving(true);
    const url = editingId
      ? `/api/pets/${petId}/symptoms/${editingId}`
      : `/api/pets/${petId}/symptoms`;
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save symptom. Check the fields and try again.");
      return;
    }
    toast.success(`Symptom ${editingId ? "updated" : "added"}`);
    closeForm();
    router.refresh();
  }

  async function updateStatus(s: ActiveSymptom, status: string) {
    setBusyId(s.symptom_id);
    const res = await fetch(`/api/pets/${petId}/symptoms/${s.symptom_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    if (!res.ok) {
      toast.error("Could not update symptom.");
      return;
    }
    toast.success(`${s.name} marked ${status}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(
      `/api/pets/${petId}/symptoms/${pendingDelete.symptom_id}`,
      { method: "DELETE" },
    );
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not remove symptom.");
      return;
    }
    toast.success(`${pendingDelete.name} removed`);
    setPendingDelete(null);
    router.refresh();
  }

  const formFields = (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="sym-name">Symptom</Label>
          <Input
            id="sym-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Vomiting"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sym-severity">Severity</Label>
          <select
            id="sym-severity"
            value={form.severity}
            onChange={(e) => set("severity", e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="unknown">Unknown</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="sym-date">Detected on</Label>
          <Input
            id="sym-date"
            type="date"
            value={form.detected_at}
            onChange={(e) => set("detected_at", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sym-notes">Notes</Label>
          <Input
            id="sym-notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="e.g. after meals"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : editingId ? "Save changes" : "Save symptom"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
          Cancel
        </Button>
      </div>
    </form>
  );

  const renderRow = (s: ActiveSymptom) =>
    editingId === s.symptom_id ? (
      <li key={s.symptom_id}>{formFields}</li>
    ) : (
      <li
        key={s.symptom_id}
        className={cn(
          "flex items-start justify-between gap-3 rounded-lg border p-3 text-sm",
          s.status === "resolved" && "opacity-60",
        )}
      >
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "font-medium capitalize",
                s.status === "resolved" && "line-through",
              )}
            >
              {s.name}
            </span>
            <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
              {s.status}
            </Badge>
            {s.severity && s.severity !== "unknown" && (
              <Badge variant={SEVERITY_VARIANT[s.severity] ?? "outline"}>
                {s.severity}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Since {s.detected_at}
            {s.status === "resolved" && s.resolved_at
              ? ` · resolved ${s.resolved_at}`
              : ""}
          </span>
          {s.notes && (
            <span className="text-xs text-muted-foreground">{s.notes}</span>
          )}
        </div>
        <div className="flex shrink-0 gap-0.5">
          {s.status !== "resolved" ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={busyId === s.symptom_id}
                onClick={() => updateStatus(s, "resolved")}
                aria-label={`Mark ${s.name} resolved`}
                title="Mark resolved"
              >
                <Check className="size-4" aria-hidden />
              </Button>
              {s.status !== "improving" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === s.symptom_id}
                  onClick={() => updateStatus(s, "improving")}
                  aria-label={`Mark ${s.name} improving`}
                  title="Mark improving"
                >
                  <TrendingUp className="size-4" aria-hidden />
                </Button>
              )}
              {s.status !== "worsened" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === s.symptom_id}
                  onClick={() => updateStatus(s, "worsened")}
                  aria-label={`Mark ${s.name} worsened`}
                  title="Mark worsened"
                >
                  <TrendingDown className="size-4" aria-hidden />
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={busyId === s.symptom_id}
              onClick={() => updateStatus(s, "active")}
              aria-label={`Reactivate ${s.name}`}
              title="Reactivate"
            >
              <RotateCcw className="size-4" aria-hidden />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(s)}
            aria-label={`Edit ${s.name}`}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setPendingDelete(s)}
            aria-label={`Remove ${s.name}`}
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
          <Activity className="size-5" aria-hidden /> Active symptoms
        </h2>
        {!adding && (
          <Button variant="outline" size="sm" onClick={openAdd}>
            <Plus className="size-4" aria-hidden /> Add
          </Button>
        )}
      </div>

      {active.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          No active symptoms tracked. Add one, or they&apos;ll appear here after
          an assessment.
        </p>
      )}

      {active.length > 0 && (
        <ul className="grid gap-2">{active.map(renderRow)}</ul>
      )}

      {adding && formFields}

      {resolved.length > 0 && (
        <div className="border-t pt-2">
          <button
            type="button"
            onClick={() => setShowResolved((v) => !v)}
            className="flex w-full items-center gap-1.5 text-sm font-medium text-muted-foreground"
            aria-expanded={showResolved}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                showResolved ? "" : "-rotate-90",
              )}
              aria-hidden
            />
            Resolved ({resolved.length})
          </button>
          {showResolved && (
            <ul className="mt-2 grid gap-2">{resolved.map(renderRow)}</ul>
          )}
        </div>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {pendingDelete?.name}?</DialogTitle>
            <DialogDescription>
              This removes {pendingDelete?.name} from the tracked symptoms. To
              keep the history, mark it resolved instead.
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
