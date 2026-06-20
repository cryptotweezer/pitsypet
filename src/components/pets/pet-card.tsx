"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dog, Cat } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
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
import { cn } from "@/lib/utils";

export type PetCardData = {
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string;
  age_years: number;
  age_months: number | null;
  weight_kg: number;
  medical_conditions: unknown;
};

function ageLabel(years: number, months: number | null): string {
  if (months && months > 0) return `${years}y ${months}m`;
  if (years === 0) return "<1 year";
  return `${years} ${years === 1 ? "year" : "years"}`;
}

export function PetCard({ pet }: { pet: PetCardData }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const Icon = pet.species === "Cat" ? Cat : Dog;
  const conditions = Array.isArray(pet.medical_conditions)
    ? pet.medical_conditions.filter((c): c is string => typeof c === "string")
    : [];

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/pets/${pet.pet_id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error("Could not delete pet. Please try again.");
      return;
    }
    setConfirmOpen(false);
    toast.success(`${pet.pet_name} removed`);
    router.refresh();
  }

  return (
    <Card>
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

      <CardContent className="grid gap-2">
        <div className="flex gap-4 text-muted-foreground">
          <span>Age: {ageLabel(pet.age_years, pet.age_months)}</span>
          <span>Weight: {pet.weight_kg} kg</span>
        </div>
        {conditions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {conditions.map((c, i) => (
              <Badge key={`${c}-${i}`} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        <Link
          href={`/assessment/${pet.pet_id}`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Start Assessment
        </Link>
        <Link
          href={`/pets/${pet.pet_id}/edit`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Edit
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </Button>
      </CardFooter>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {pet.pet_name}?</DialogTitle>
            <DialogDescription>
              This removes {pet.pet_name} from your dashboard. Past assessments
              are kept. This can’t be undone from here.
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
    </Card>
  );
}
