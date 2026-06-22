import { z } from "zod";

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

export const activeSymptomSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  severity: z.enum(["mild", "moderate", "severe", "unknown"]).optional(),
  status: z.enum(["active", "improving", "worsened", "resolved"]).optional(),
  detected_at: optionalDate,
  notes: optionalText(2000),
});

// Status updates also stamp resolved_at when moving to resolved (handled in the
// route). Partial so the chat/UI can patch a single field.
export const activeSymptomUpdateSchema = activeSymptomSchema.partial();

export type ActiveSymptomInput = z.infer<typeof activeSymptomSchema>;
