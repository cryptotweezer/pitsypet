import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

export const vetContactSchema = z
  .object({
    doctor_name: optionalText(200),
    clinic_name: optionalText(200),
    phone: optionalText(50),
    email: z
      .string()
      .trim()
      .email("Enter a valid email")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    notes: optionalText(2000),
  })
  .refine((v) => v.doctor_name || v.clinic_name, {
    message: "Add at least a doctor or clinic name",
    path: ["clinic_name"],
  });

export const vetContactUpdateSchema = z.object({
  doctor_name: optionalText(200),
  clinic_name: optionalText(200),
  phone: optionalText(50),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: optionalText(2000),
});

export type VetContactInput = z.infer<typeof vetContactSchema>;
