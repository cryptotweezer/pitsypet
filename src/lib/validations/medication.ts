import { z } from "zod";

// Optional free-text field that normalises "" → undefined so blank inputs don't
// persist empty strings.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const medicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  dosage: optionalText(100),
  quantity: optionalText(100),
  frequency: optionalText(100),
  notes: optionalText(2000),
  prescribed_by: optionalText(200),
  started_at: optionalDate,
  ended_at: optionalDate,
  active: z.boolean().optional(),
});

export const medicationUpdateSchema = medicationSchema.partial();

export type MedicationInput = z.infer<typeof medicationSchema>;
