import { z } from "zod";

// Single source of truth for pet field rules. Both the client form
// (petFormSchema, string-based) and the API (petApiSchema, typed) derive their
// numeric limits from here. NOTE: the shape produced by petApiSchema is consumed
// verbatim by the Phase 5 triage engine (formatPet + RAG query) — keep it stable.

export const SPECIES = ["Dog", "Cat"] as const;
export type Species = (typeof SPECIES)[number];

export const AGE_YEARS_MAX = 25;
export const AGE_MONTHS_MAX = 11;
export const MAX_CONDITIONS = 10;

// Species-specific sane weight bounds (kg).
export const WEIGHT_BOUNDS: Record<Species, { min: number; max: number }> = {
  Dog: { min: 0.5, max: 120 },
  Cat: { min: 0.3, max: 15 },
};

function weightIssue(
  species: Species,
  weight: number,
  ctx: z.RefinementCtx,
  path: (string | number)[],
) {
  const { min, max } = WEIGHT_BOUNDS[species];
  if (Number.isNaN(weight) || weight < min || weight > max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: `Weight for a ${species.toLowerCase()} must be between ${min} and ${max} kg`,
    });
  }
}

// ---- API schema (typed values; parses a JSON request body) ----
export const petApiSchema = z
  .object({
    pet_name: z.string().trim().min(1, "Name is required").max(50),
    species: z.enum(SPECIES),
    breed: z.string().trim().min(1, "Breed is required").max(100),
    age_years: z.coerce
      .number()
      .int("Age must be a whole number")
      .min(0)
      .max(AGE_YEARS_MAX),
    age_months: z.coerce
      .number()
      .int()
      .min(0)
      .max(AGE_MONTHS_MAX)
      .nullable()
      .optional(),
    weight_kg: z.coerce.number().positive(),
    medical_conditions: z
      .array(z.string().trim().min(1).max(60))
      .max(MAX_CONDITIONS, `Up to ${MAX_CONDITIONS} conditions`)
      .default([]),
  })
  .superRefine((d, ctx) => {
    weightIssue(d.species, d.weight_kg, ctx, ["weight_kg"]);
  });

export type PetApiInput = z.infer<typeof petApiSchema>;

// ---- Form schema (all string inputs; numbers validated as strings) ----
const numericString = (max: number, label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(
      (v) => /^\d+(\.\d+)?$/.test(v.trim()) && Number(v) <= max,
      `Enter a valid ${label.toLowerCase()} (0–${max})`,
    );

export const petFormSchema = z
  .object({
    pet_name: z.string().trim().min(1, "Name is required").max(50),
    species: z.enum(SPECIES),
    breed: z.string().trim().min(1, "Breed is required").max(100),
    age_years: numericString(AGE_YEARS_MAX, "Age"),
    age_months: z
      .string()
      .refine(
        (v) =>
          v.trim() === "" ||
          (/^\d+$/.test(v.trim()) && Number(v) <= AGE_MONTHS_MAX),
        `Months must be 0–${AGE_MONTHS_MAX}`,
      ),
    weight_kg: z
      .string()
      .min(1, "Weight is required")
      .refine((v) => /^\d+(\.\d+)?$/.test(v.trim()) && Number(v) > 0, "Enter a valid weight"),
    medical_conditions: z
      .array(z.string())
      .max(MAX_CONDITIONS, `Up to ${MAX_CONDITIONS} conditions`),
  })
  .superRefine((d, ctx) => {
    weightIssue(d.species, Number(d.weight_kg), ctx, ["weight_kg"]);
  });

export type PetFormValues = z.infer<typeof petFormSchema>;

// Convert validated form strings into the typed API payload.
export function formValuesToApiInput(v: PetFormValues): PetApiInput {
  return {
    pet_name: v.pet_name.trim(),
    species: v.species,
    breed: v.breed.trim(),
    age_years: Number(v.age_years),
    age_months: v.age_months.trim() === "" ? null : Number(v.age_months),
    weight_kg: Number(v.weight_kg),
    medical_conditions: v.medical_conditions,
  };
}
