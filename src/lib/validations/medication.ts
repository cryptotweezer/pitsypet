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

const medicationBase = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  dosage: optionalText(100),
  dosage_unit: optionalText(30),
  quantity: optionalText(100),
  frequency: optionalText(100),
  notes: optionalText(2000),
  prescribed_by: optionalText(200),
  started_at: optionalDate,
  ended_at: optionalDate,
  active: z.boolean().optional(),
});

// When both dates are present, the end must not precede the start.
const endNotBeforeStart = (v: {
  started_at?: string;
  ended_at?: string;
}) => !(v.started_at && v.ended_at) || v.ended_at >= v.started_at;
const dateError = {
  message: "End date can't be before the start date",
  path: ["ended_at"] as (string | number)[],
};

export const medicationSchema = medicationBase.refine(
  endNotBeforeStart,
  dateError,
);

export const medicationUpdateSchema = medicationBase
  .partial()
  .refine(endNotBeforeStart, dateError);

export type MedicationInput = z.infer<typeof medicationSchema>;
