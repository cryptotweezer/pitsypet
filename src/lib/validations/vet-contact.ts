import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

// A clinic can publish structured opening hours: one row per open day with a
// HH:MM open/close. The UI offers click-to-pick days + times; free-text notes
// stay separate so hours are queryable and tidy.
export const serviceHourSchema = z.object({
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
  open: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
});

export type ServiceHour = z.infer<typeof serviceHourSchema>;

// vet_contacts now represents a CLINIC (doctors live in vet_doctors).
const vetContactBase = {
  clinic_name: optionalText(200),
  phone: optionalText(50),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  address: optionalText(500),
  service_hours: z.array(serviceHourSchema).max(7).optional(),
  notes: optionalText(2000),
};

export const vetContactSchema = z
  .object(vetContactBase)
  .refine((v) => Boolean(v.clinic_name), {
    message: "Add a clinic name",
    path: ["clinic_name"],
  });

export const vetContactUpdateSchema = z.object(vetContactBase);

export type VetContactInput = z.infer<typeof vetContactSchema>;
