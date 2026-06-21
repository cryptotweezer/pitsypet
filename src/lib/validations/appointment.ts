import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal("").transform(() => undefined));

// A scheduled future visit. scheduled_at is an ISO datetime (from a
// datetime-local input, converted to ISO client-side or accepted as-is).
export const appointmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  scheduled_at: z
    .string()
    .min(1, "Date & time is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date & time"),
  reason: optionalText(2000),
  notes: optionalText(2000),
  outcome: optionalText(2000),
  vet_contact_id: optionalUuid,
});

export const appointmentUpdateSchema = appointmentSchema.partial();

export type AppointmentInput = z.infer<typeof appointmentSchema>;
