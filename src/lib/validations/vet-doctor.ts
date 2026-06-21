import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

// A doctor who treats the pet at a given clinic (vet_contact). Several doctors
// can belong to one clinic.
export const vetDoctorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  specialty: optionalText(200),
  phone: optionalText(50),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: optionalText(2000),
});

export const vetDoctorUpdateSchema = vetDoctorSchema.partial();

export type VetDoctorInput = z.infer<typeof vetDoctorSchema>;
