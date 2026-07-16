"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Assessments are saved automatically when they complete; this lets the owner
// remove one from their history (soft delete).
export function DeleteButton({
  assessmentId,
  returnHref = "/dashboard",
}: {
  assessmentId: string;
  returnHref?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/assessment/${assessmentId}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not delete. Please try again.");
      return;
    }
    setOpen(false);
    toast.success("Assessment deleted");
    router.push(returnHref);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10 active:scale-95"
      >
        <Trash2 className="size-4" aria-hidden /> Delete
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this assessment?</DialogTitle>
            <DialogDescription>
              This removes it from your history. This can’t be undone from here.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
