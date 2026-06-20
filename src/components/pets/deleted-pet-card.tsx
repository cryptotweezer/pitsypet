"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dog, Cat, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DeletedPetData = {
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string;
};

export function DeletedPetCard({ pet }: { pet: DeletedPetData }) {
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purging, setPurging] = useState(false);

  const Icon = pet.species === "Cat" ? Cat : Dog;

  async function handleRestore() {
    setRestoring(true);
    const res = await fetch(`/api/pets/${pet.pet_id}/restore`, {
      method: "POST",
    });
    setRestoring(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      toast.error(body?.error ?? "Could not restore pet. Please try again.");
      return;
    }
    toast.success(`${pet.pet_name} restored with its assessment history`);
    router.refresh();
  }

  async function handlePurge() {
    setPurging(true);
    const res = await fetch(`/api/pets/${pet.pet_id}/purge`, {
      method: "DELETE",
    });
    setPurging(false);
    if (!res.ok) {
      toast.error("Could not delete pet. Please try again.");
      return;
    }
    setPurgeOpen(false);
    toast.success(`${pet.pet_name} permanently deleted`);
    router.refresh();
  }

  return (
    <Card className="opacity-80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="grid">
            <CardTitle>{pet.pet_name}</CardTitle>
            <CardDescription>
              {pet.breed} · {pet.species}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestore}
          disabled={restoring}
        >
          <RotateCcw className="size-4" />
          {restoring ? "Restoring…" : "Restore"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => setPurgeOpen(true)}
        >
          <Trash2 className="size-4" />
          Delete permanently
        </Button>
      </CardContent>

      <Dialog open={purgeOpen} onOpenChange={setPurgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete {pet.pet_name}?</DialogTitle>
            <DialogDescription>
              This removes {pet.pet_name} and all of its past assessments from
              the database for good. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={handlePurge}
              disabled={purging}
            >
              {purging ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
