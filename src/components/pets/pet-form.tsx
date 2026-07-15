"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BreedAutocomplete } from "@/components/pets/breed-autocomplete";
import {
  petFormSchema,
  formValuesToApiInput,
  MAX_CONDITIONS,
  SPECIES,
  type PetFormValues,
  type Species,
} from "@/lib/validations/pet";

type PetInitial = {
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string;
  age_years: number;
  age_months: number | null;
  weight_kg: number;
  medical_conditions: unknown;
};

interface PetFormProps {
  mode: "create" | "edit";
  pet?: PetInitial;
  /** Inline usage (e.g. the dashboard Pets tab): called after a successful
   *  save instead of navigating away. The router is still refreshed. */
  onDone?: () => void;
  /** Inline usage: called on Cancel instead of navigating to the dashboard. */
  onCancel?: () => void;
}

function toConditions(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((c): c is string => typeof c === "string") : [];
}

export function PetForm({ mode, pet, onDone, onCancel }: PetFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [conditionInput, setConditionInput] = useState("");

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    mode: "onChange",
    defaultValues: {
      pet_name: pet?.pet_name ?? "",
      species: (pet?.species as Species) ?? "Dog",
      breed: pet?.breed ?? "",
      age_years: pet ? String(pet.age_years) : "",
      age_months:
        pet?.age_months !== undefined && pet?.age_months !== null
          ? String(pet.age_months)
          : "",
      weight_kg: pet ? String(pet.weight_kg) : "",
      medical_conditions: toConditions(pet?.medical_conditions),
    },
  });

  const species = form.watch("species");
  const conditions = form.watch("medical_conditions");

  function addCondition() {
    const v = conditionInput.trim();
    if (!v) return;
    if (conditions.length >= MAX_CONDITIONS) return;
    if (conditions.some((c) => c.toLowerCase() === v.toLowerCase())) {
      setConditionInput("");
      return;
    }
    form.setValue("medical_conditions", [...conditions, v], {
      shouldValidate: true,
    });
    setConditionInput("");
  }

  function removeCondition(idx: number) {
    form.setValue(
      "medical_conditions",
      conditions.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: PetFormValues) {
    setServerError(null);
    const payload = formValuesToApiInput(values);
    const url = mode === "edit" ? `/api/pets/${pet!.pet_id}` : "/api/pets";
    const method = mode === "edit" ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setServerError(
        data.error ?? "Something went wrong. Please try again.",
      );
      return;
    }

    // TODO(Phase 5): on create, if this is the user's first pet, redirect to
    // /assessment/[newPetId] instead of the dashboard (route doesn't exist yet).
    toast.success(mode === "edit" ? "Pet updated" : "Pet added");
    if (onDone) {
      router.refresh();
      onDone();
    } else {
      router.push("/dashboard/pets");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {serverError && (
          <p
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {serverError}
          </p>
        )}

        <FormField
          control={form.control}
          name="pet_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bella" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <div className="flex gap-2">
                {SPECIES.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={field.value === s ? "default" : "outline"}
                    size="lg"
                    onClick={() => {
                      field.onChange(s);
                      // Breed list is species-specific — clear on switch.
                      form.setValue("breed", "", { shouldValidate: true });
                    }}
                  >
                    {s}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="breed"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Breed</FormLabel>
              <BreedAutocomplete
                id="breed"
                value={field.value}
                onChange={field.onChange}
                species={species}
                aria-invalid={!!fieldState.error}
              />
              <FormDescription>
                Not listed? Keep typing and choose the custom-breed option.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age_years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={25} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Months (optional)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={11} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="weight_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  inputMode="decimal"
                  placeholder={species === "Cat" ? "e.g. 4.5" : "e.g. 28"}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {species === "Cat" ? "Cats: 0.3–15 kg." : "Dogs: 0.5–120 kg."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medical_conditions"
          render={() => (
            <FormItem>
              <FormLabel>Medical conditions (optional)</FormLabel>
              <FormControl>
                <Input
                  value={conditionInput}
                  placeholder="Type a condition and press Enter"
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addCondition();
                    }
                  }}
                  disabled={conditions.length >= MAX_CONDITIONS}
                />
              </FormControl>
              <FormDescription>
                Up to {MAX_CONDITIONS}. Press Enter or comma to add each one.
              </FormDescription>
              {conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {conditions.map((c, i) => (
                    <Badge key={`${c}-${i}`} variant="secondary" className="gap-1">
                      {c}
                      <button
                        type="button"
                        aria-label={`Remove ${c}`}
                        onClick={() => removeCondition(i)}
                        className="rounded-full hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Add pet"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              onCancel ? onCancel() : router.push("/dashboard/pets")
            }
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
