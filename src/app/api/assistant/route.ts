import { NextResponse } from "next/server";
import {
  streamText,
  tool,
  createDataStreamResponse,
  convertToCoreMessages,
  type Message,
  type JSONValue,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { chatRateLimiter } from "@/lib/rate-limit";
import { checkDailyCap } from "@/lib/cost-guard";
import { arcjetGuard } from "@/lib/arcjet";
import {
  loadPetDossier,
  loadUserClinics,
  clinicOpenAt,
  formatServiceHours,
  type PetDossier,
  type PetRow,
  type ProposedAction,
  type ProposedActionKind,
} from "@/lib/ai/assistant";

export const runtime = "nodejs";
export const maxDuration = 60;

const PET_COLUMNS =
  "pet_id, pet_name, species, breed, age_years, age_months, weight_kg, medical_conditions";

function canon(s: string): string {
  return s.trim().toLowerCase();
}

// Today's calendar date IN THE USER'S timezone (sent by the browser). The server
// runs in UTC, so we must anchor "today" to the user's zone — otherwise near
// midnight the date is off by a day. Falls back to UTC for a missing/invalid tz.
function todayInTimeZone(timeZone: string): { y: number; m: number; d: number } {
  try {
    // en-CA formats as YYYY-MM-DD.
    const s = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const [y, m, d] = s.split("-").map(Number);
    if (y && m && d) return { y, m, d };
  } catch {
    // invalid timeZone → fall through to UTC
  }
  const base = new Date();
  return {
    y: base.getUTCFullYear(),
    m: base.getUTCMonth() + 1,
    d: base.getUTCDate(),
  };
}

// Precomputed weekday→date table for the next `days` days, anchored to the
// user's local "today". Haiku is unreliable at "what date is next Monday", so we
// hand it the answers and tell it to look them up rather than compute. A
// calendar date's weekday is timezone-independent, so we derive both from a
// UTC-midnight Date built from the user-local Y/M/D.
function buildDateReference(days: number, timeZone: string): string {
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const { y, m, d } = todayInTimeZone(timeZone);
  const lines: string[] = [];
  for (let i = 0; i < days; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    const iso = dt.toISOString().slice(0, 10);
    const wd = WD[dt.getUTCDay()];
    const tag = i === 0 ? " — today" : i === 1 ? " — tomorrow" : "";
    lines.push(`- ${iso} (${wd})${tag}`);
  }
  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are PitsyPet's assistant — a friendly, careful helper for a pet owner managing their pets' health records. You are NOT a vet and never give a diagnosis; for triage of new/worsening symptoms, offer to start an assessment, and for emergencies tell them to contact a vet now.

You can SEE each pet's full record below (conditions, active symptoms, medications, vet clinics + doctors, appointments, recent assessments). Use it to answer questions accurately and concretely.

ALWAYS reply with visible text — every single turn, write a short message to the owner in plain text, even when you also call a propose_* tool (e.g. "Sure — here's the medication to confirm:"). NEVER respond with only a tool call and no text: a tool-only reply leaves the chat looking frozen with nothing on screen.

WRITING TO THE RECORD — read carefully:
- You can NOT write to the database yourself. When the owner wants to add, change, or cancel something — a new pet, a medication, appointment (add OR cancel), vet clinic, doctor, or a symptom update — you MUST call the matching propose_* tool. Calling the tool is what shows the owner the Confirm button.
- If the owner has no pets yet (or wants to add another), help them create one: gather name, species (Dog or Cat), breed, age, and weight, then call propose_create_pet. Weight is in kilograms — convert from pounds if needed.
- As soon as you have the fields, CALL THE TOOL in that same message. Do NOT ask "shall I confirm?" or "is this correct?" first — the tool's Confirm button IS the confirmation step, so a separate question just wastes a turn.
- NEVER tell the owner you've "prepared"/"registered"/"saved" anything unless you actually called the propose_* tool in that very message. If you didn't call the tool, you have done nothing yet. (Saying "Confirma abajo" without a tool call is a bug — there will be no button.)
- COLLECT EVERY FIELD of the thing you're recording before calling the tool. Ask for any field still missing, one short question at a time. Only leave a field blank if the owner says they don't have it or asks to skip it. The fields are:
  • New pet: name, species (Dog or Cat), breed, age (years, optional months), weight (kg), any known ongoing conditions.
  • Medication: name, dose amount, dose unit, quantity, frequency, prescribing CLINIC, prescribing DOCTOR, start date (REQUIRED — always ask for it if not given), end date (or mark ongoing), notes. The clinic and the doctor are SEPARATE fields: pass the clinic to prescribed_clinic and the doctor to prescribed_doctor (either may be blank). e.g. "prescribed by Mavi at Pet Lovers" → prescribed_doctor "Mavi", prescribed_clinic "Pet Lovers".
  • Appointment: title, date & time, clinic, doctor, reason, your notes. The doctor (doctorName) is separate from the clinic — if a clinic is chosen, the doctor should normally be one of that clinic's doctors (see DOCTORS below), but a free name is fine.
  • Vet clinic: clinic name, phone, email, address, opening hours, notes. When adding a clinic you can also add its doctors in the SAME proposal — pass them in the doctors list; don't make a second card for them.
  • Doctor: clinic, name, specialty, phone, email, notes.
- A medication's DOSE and its QUANTITY are two different things — never mix them up:
  • dose amount (dosage) + dose unit (dosage_unit) = the STRENGTH of one dose, measured in mg / ml / mcg / g / IU. e.g. "20 mg" → dosage "20", dosage_unit "mg".
  • quantity = HOW MUCH is given each time (the count of the physical form): number of tablets, capsules, drops, sachets, etc. e.g. "1 tablet", "2 drops", "half a tablet".
  So "give one 20 mg tablet" → dosage "20", dosage_unit "mg", quantity "1 tablet". If the owner gives a strength number with no unit, ask which unit (mg, ml, mcg, g, IU). "tablet"/"capsule"/"drop" is NOT a dose unit — it's the quantity.
- VET OPENING HOURS: when the owner tells you when a clinic is open, put it in the structured service_hours list (one entry per open day: day + open time + close time in 24h HH:MM), NOT in the notes free-text. e.g. "Mon–Fri 9 to 5, Sat 9–1" → entries for Mon..Fri 09:00–17:00 and Sat 09:00–13:00.
- For an APPOINTMENT specifically: before you propose it, ask whether there is a particular reason for the visit (or if it's just a routine check / follow-up) AND whether they want to add any notes or observations (e.g. things to bring, questions for the vet, what they're noticing) — unless they already told you. Ask these together in one short question; if they say there are none, leave those fields blank and propose.
- DOCTORS: the owner's clinics and their doctors are listed below. Whenever a doctor is relevant (e.g. "prescribed by" on a medication, or booking with a doctor) and the owner names only a CLINIC or says they don't remember the doctor's name, look that clinic up in the records and use its doctors: if the clinic has exactly one doctor, offer it ("Pet Barn has Dr Lorieth — was it her?"); if it has several, list them and ask which; only leave it blank if the clinic has no doctors on record or the owner says to skip. If the owner gives a doctor's name, match it to a known doctor when you can.
- DATES: NEVER compute weekdays or do date arithmetic in your head — you get them wrong. Use the "Date reference" table below: when the owner names a weekday ("lunes"/"Monday"), "today"/"hoy", "tomorrow"/"mañana", "next Monday", "in a week", etc., LOOK UP the exact YYYY-MM-DD in that table and use it verbatim. "next <weekday>" = the first row with that weekday strictly after today. ALWAYS pass dates to tools as YYYY-MM-DD (appointment date-times as full ISO, e.g. 2026-06-29T16:00). Never pass words like "today"/"hoy"/"lunes" to a tool, and never state a weekday that disagrees with the table.
- To begin a symptom assessment, call propose_start_assessment (it shows a Start button). ALWAYS call it in the SAME message whenever the owner asks to start/begin an assessment — even if you offered one earlier in this conversation (a page refresh clears earlier buttons, so a previous one may be gone). Never say "the button should appear below" or tell them to wait/refresh without calling the tool right now.

Be concise and plain-spoken. One topic at a time.`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Arcjet shield + bot detection before any DB/AI work.
  const blocked = await arcjetGuard(req);
  if (blocked) return blocked;

  let body: {
    scope?: "pet" | "dashboard";
    petId?: string;
    messages?: Message[];
    timeZone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { scope, petId, messages, timeZone } = body;
  if (!scope || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (scope === "pet" && !petId) {
    return NextResponse.json({ error: "Missing petId" }, { status: 400 });
  }

  if (await checkDailyCap()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable — please try again later." },
      { status: 503 },
    );
  }
  const { success } = await chatRateLimiter.limit(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests — please slow down." },
      { status: 429 },
    );
  }

  // Vet clinics are owner-level (shared across all pets), loaded once.
  const userClinics = await loadUserClinics(supabase);

  // Load the pets this chat can act on. Pet scope: the focused pet (full
  // dossier) + a name-only roster of the owner's other pets for awareness.
  // Dashboard scope: full dossiers for all of the owner's pets.
  let dossiers: PetDossier[] = [];
  let otherPetNames: string[] = [];

  if (scope === "pet") {
    const { data: pet } = await supabase
      .from("pets")
      .select(PET_COLUMNS)
      .eq("pet_id", petId!)
      .is("deleted_at", null)
      .maybeSingle();
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }
    dossiers = [await loadPetDossier(supabase, pet as PetRow)];
    const { data: others } = await supabase
      .from("pets")
      .select("pet_name")
      .neq("pet_id", petId!)
      .is("deleted_at", null);
    otherPetNames = (others ?? []).map((p) => p.pet_name);
  } else {
    const { data: pets } = await supabase
      .from("pets")
      .select(PET_COLUMNS)
      .is("deleted_at", null)
      .order("pet_name");
    dossiers = await Promise.all(
      (pets ?? []).map((p) => loadPetDossier(supabase, p as PetRow)),
    );
  }

  // Resolve a pet by name for write actions. Pet scope is locked to the focused
  // pet; dashboard scope resolves against the owner's pets (case-insensitive).
  const byName = new Map(dossiers.map((d) => [canon(d.petName), d]));
  function resolvePet(name?: string): PetDossier | null {
    if (scope === "pet") return dossiers[0] ?? null;
    if (!name) return null;
    return byName.get(canon(name)) ?? null;
  }

  const recordsBlock = dossiers
    .map((d) => `### ${d.petName}\n${d.text}`)
    .join("\n\n");
  const scopeNote =
    scope === "pet"
      ? `\n\nThis chat is focused on ${dossiers[0]?.petName ?? "this pet"}. ${
          otherPetNames.length > 0
            ? `The owner also has: ${otherPetNames.join(", ")} (open their page to change their records).`
            : ""
        } Any change you propose applies to ${dossiers[0]?.petName ?? "this pet"}.`
      : `\n\nThis is the all-pets dashboard chat. ALWAYS be certain which pet an action is for and pass that pet's exact name; if it's unclear, ask before proposing anything.`;
  // A precomputed date table so the model never does weekday arithmetic (Haiku
  // gets "next Monday" wrong). 21 days from today, in UTC to match the ISO
  // dates we emit. The model looks up the exact YYYY-MM-DD instead of computing.
  const dateReference = buildDateReference(21, timeZone || "UTC");
  const recordsSection =
    dossiers.length === 0
      ? "The owner has no pets on record yet. Your first job is to help them create one with propose_create_pet."
      : `The owner's pet records:\n\n${recordsBlock}`;
  // Owner-level vet clinics are shared by all pets and shown once.
  const clinicsSection = `The owner's vet clinics (shared across ALL pets — when adding a doctor or booking an appointment, use one of these):\n${userClinics.text}`;
  const systemPrompt = `${SYSTEM_PROMPT}\n\nDate reference (use these EXACT dates; do NOT compute weekdays yourself):\n${dateReference}\n\n${recordsSection}\n\n${clinicsSection}${scopeNote}`;

  // Each proposal emits a confirm card to the client and writes nothing itself.
  const proposals: ProposedAction[] = [];
  let counter = 0;

  return createDataStreamResponse({
    execute: (dataStream) => {
      function emitAction(
        kind: ProposedActionKind,
        petId: string,
        petName: string,
        summary: string,
        rest: Pick<ProposedAction, "endpoint" | "method" | "payload" | "href">,
      ): string {
        const action: ProposedAction = {
          id: `act-${Date.now()}-${counter++}`,
          kind,
          petId,
          petName,
          summary,
          ...rest,
        };
        proposals.push(action);
        dataStream.writeData({
          type: "action",
          action,
        } as unknown as JSONValue);
        return `Prepared for confirmation: ${summary}. Tell the owner to confirm it below — it is NOT saved yet.`;
      }

      function emit(
        kind: ProposedActionKind,
        d: PetDossier,
        summary: string,
        rest: Pick<ProposedAction, "endpoint" | "method" | "payload" | "href">,
      ): string {
        return emitAction(kind, d.petId, d.petName, summary, rest);
      }

      // Shared "which pet?" guard for dashboard scope.
      const needPet = (name?: string): PetDossier | string => {
        const d = resolvePet(name);
        if (!d)
          return scope === "pet"
            ? "No pet in context."
            : `I'm not sure which pet that's for. The pets are: ${dossiers
                .map((x) => x.petName)
                .join(", ")}. Which one?`;
        return d;
      };

      const result = streamText({
        model: anthropic("claude-haiku-4-5-20251001"),
        system: systemPrompt,
        messages: convertToCoreMessages(messages),
        maxSteps: 5,
        tools: {
          propose_add_medication: tool({
            description:
              "Prepare adding a medication to a pet's record (requires owner confirmation). Dose and quantity are DIFFERENT: dosage+dosage_unit is the strength of one dose (mg/ml/mcg/g/IU), quantity is how many of the physical form is given each time (tablets/drops/capsules). 'one 20 mg tablet' → dosage '20', dosage_unit 'mg', quantity '1 tablet'. If a strength number has no unit, ask which unit.",
            parameters: z.object({
              petName: z.string().optional(),
              name: z.string(),
              dosage: z
                .string()
                .optional()
                .describe("Numeric strength of one dose, e.g. '20', '1.5'"),
              dosage_unit: z
                .string()
                .optional()
                .describe(
                  "Unit of the dose STRENGTH: mg, ml, mcg, g, or IU. NOT 'tablet'/'drop' — those are the quantity.",
                ),
              quantity: z
                .string()
                .optional()
                .describe(
                  "How much is given each time: count of the physical form, e.g. '1 tablet', '2 drops', '30 capsules'",
                ),
              frequency: z.string().optional(),
              prescribed_clinic: z
                .string()
                .optional()
                .describe("The prescribing clinic's name, e.g. 'Pet Lovers'"),
              prescribed_doctor: z
                .string()
                .optional()
                .describe("The prescribing doctor's name, e.g. 'Dr Mavi'"),
              started_at: z.string().optional(),
              ended_at: z.string().optional(),
              notes: z.string().optional(),
            }),
            execute: async ({
              petName,
              prescribed_clinic,
              prescribed_doctor,
              ...m
            }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              const dose = [m.dosage, m.dosage_unit].filter(Boolean).join(" ");
              const detail = [dose, m.frequency].filter(Boolean).join(" · ");
              // Store as "Doctor — Clinic" (either part optional) — the same
              // format the medication form uses, so it round-trips on edit.
              const prescribed_by = [prescribed_doctor, prescribed_clinic]
                .map((s) => s?.trim())
                .filter(Boolean)
                .join(" — ");
              const by = prescribed_by ? `, prescribed by ${prescribed_by}` : "";
              return emit(
                "add_medication",
                d,
                `Add medication "${m.name}"${detail ? ` (${detail})` : ""}${by} for ${d.petName}`,
                {
                  endpoint: `/api/pets/${d.petId}/medications`,
                  payload: { ...m, prescribed_by, active: true },
                },
              );
            },
          }),
          propose_add_appointment: tool({
            description:
              "Prepare adding a vet appointment (requires owner confirmation). scheduled_at must be an ISO datetime. If the chosen clinic is CLOSED at that day/time, this tool will NOT create the appointment — it returns a warning for you to relay; only after the owner says they want it anyway, call again with confirmedOutsideHours: true.",
            parameters: z.object({
              petName: z.string().optional(),
              title: z.string(),
              scheduled_at: z.string(),
              reason: z.string().optional(),
              notes: z.string().optional(),
              clinicName: z.string().optional(),
              doctorName: z
                .string()
                .optional()
                .describe(
                  "The doctor for this visit. If a clinic is chosen, normally one of that clinic's doctors; a free name is fine.",
                ),
              confirmedOutsideHours: z
                .boolean()
                .optional()
                .describe(
                  "Set true ONLY after the owner has confirmed they still want the appointment despite the clinic being closed at that time.",
                ),
            }),
            execute: async ({
              petName,
              clinicName,
              doctorName,
              confirmedOutsideHours,
              ...a
            }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              const clinic = clinicName
                ? userClinics.clinics.find(
                    (c) => canon(c.name) === canon(clinicName),
                  )
                : undefined;

              // Deterministic open/closed check against the clinic's hours. If
              // closed and not yet confirmed, don't propose — ask the owner.
              if (
                clinic &&
                clinic.service_hours.length > 0 &&
                !confirmedOutsideHours
              ) {
                const check = clinicOpenAt(a.scheduled_at, clinic.service_hours);
                if (check && !check.open) {
                  return `${clinic.name} looks CLOSED on ${check.dayLabel} at ${check.timeLabel}. Its opening hours are: ${formatServiceHours(
                    clinic.service_hours,
                  )}. Tell the owner the clinic is closed then and ask if they want to book it anyway or pick another time. Do NOT create it yet. Only if they confirm they want it anyway, call propose_add_appointment again with confirmedOutsideHours: true.`;
                }
              }

              const when = new Date(a.scheduled_at);
              const whenStr = Number.isNaN(when.getTime())
                ? a.scheduled_at
                : when.toLocaleString();
              const withWhom = [clinic?.name, doctorName?.trim()]
                .filter(Boolean)
                .join(" · ");
              return emit(
                "add_appointment",
                d,
                `Book "${a.title}" for ${d.petName} on ${whenStr}${withWhom ? ` at ${withWhom}` : ""}`,
                {
                  endpoint: `/api/pets/${d.petId}/appointments`,
                  payload: {
                    ...a,
                    vet_contact_id: clinic?.id,
                    doctor_name: doctorName?.trim() || undefined,
                  },
                },
              );
            },
          }),
          propose_cancel_appointment: tool({
            description:
              "Prepare cancelling an existing appointment (requires owner confirmation). Identify it by title and/or date from the records below.",
            parameters: z.object({
              petName: z.string().optional(),
              title: z.string().optional(),
              date: z
                .string()
                .optional()
                .describe("The appointment date as YYYY-MM-DD, if known"),
            }),
            execute: async ({ petName, title, date }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              if (d.appointments.length === 0)
                return `${d.petName} has no appointments on record to cancel.`;
              const matches = d.appointments.filter((a) => {
                const titleOk = title
                  ? canon(a.title).includes(canon(title))
                  : true;
                const dateOk = date
                  ? a.scheduled_at.slice(0, 10) === date
                  : true;
                return titleOk && dateOk;
              });
              if (matches.length === 0)
                return `I couldn't find that appointment for ${d.petName}. Current appointments: ${d.appointments
                  .map((a) => `"${a.title}" on ${a.scheduled_at.slice(0, 10)}`)
                  .join("; ")}. Which one?`;
              if (matches.length > 1)
                return `More than one appointment matches for ${d.petName}: ${matches
                  .map((a) => `"${a.title}" on ${a.scheduled_at.slice(0, 10)}`)
                  .join("; ")}. Which one (give the date)?`;
              const appt = matches[0];
              return emit(
                "cancel_appointment",
                d,
                `Cancel "${appt.title}" on ${new Date(appt.scheduled_at).toLocaleString()} for ${d.petName}`,
                {
                  endpoint: `/api/pets/${d.petId}/appointments/${appt.id}`,
                  method: "DELETE",
                },
              );
            },
          }),
          propose_add_vet_contact: tool({
            description:
              "Prepare adding a vet clinic (requires owner confirmation). Clinics are owner-level and shared across ALL the owner's pets — they are NOT tied to one pet. Put opening hours in service_hours (structured), not notes. If the owner also names doctors for this clinic, include them in the doctors list — they're saved with the clinic in the same confirmation.",
            parameters: z.object({
              clinic_name: z.string(),
              phone: z.string().optional(),
              email: z.string().optional(),
              address: z.string().optional(),
              service_hours: z
                .array(
                  z.object({
                    day: z.enum([
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ]),
                    open: z
                      .string()
                      .describe("Opening time, 24h HH:MM e.g. 09:00"),
                    close: z
                      .string()
                      .describe("Closing time, 24h HH:MM e.g. 17:00"),
                  }),
                )
                .optional()
                .describe("One entry per open day. Omit days the clinic is closed."),
              doctors: z
                .array(
                  z.object({
                    name: z.string(),
                    specialty: z.string().optional(),
                    phone: z.string().optional(),
                    email: z.string().optional(),
                    notes: z.string().optional(),
                  }),
                )
                .optional()
                .describe("Doctors at this clinic, saved together with it."),
              notes: z.string().optional(),
            }),
            execute: async ({ doctors, ...v }) => {
              const docNames = (doctors ?? []).map((doc) => doc.name);
              const docPart =
                docNames.length > 0
                  ? ` with ${docNames.length === 1 ? "Dr " : "doctors "}${docNames.join(", ")}`
                  : "";
              // Clinics are owner-level — not tied to a pet.
              return emitAction(
                "add_vet_contact",
                "",
                "",
                `Add vet clinic "${v.clinic_name}"${docPart}`,
                {
                  endpoint: `/api/vet-contacts`,
                  payload: { ...v, doctors },
                },
              );
            },
          }),
          propose_add_doctor: tool({
            description:
              "Prepare adding a doctor to one of the owner's existing vet clinics (requires owner confirmation). Clinics are owner-level; the clinic must already exist.",
            parameters: z.object({
              clinicName: z.string(),
              name: z.string(),
              specialty: z.string().optional(),
              phone: z.string().optional(),
              email: z.string().optional(),
              notes: z.string().optional(),
            }),
            execute: async ({ clinicName, ...doc }) => {
              const clinic = userClinics.clinics.find(
                (c) => canon(c.name) === canon(clinicName),
              );
              if (!clinic)
                return `There's no clinic called "${clinicName}". Existing clinics: ${
                  userClinics.clinics.map((c) => c.name).join(", ") || "none"
                }. Add the clinic first, or pick an existing one.`;
              return emitAction(
                "add_doctor",
                "",
                "",
                `Add Dr ${doc.name}${doc.specialty ? ` (${doc.specialty})` : ""} to ${clinic.name}`,
                {
                  endpoint: `/api/vet-contacts/${clinic.id}/doctors`,
                  payload: doc,
                },
              );
            },
          }),
          propose_update_symptoms: tool({
            description:
              "Prepare updating a pet's tracked symptoms (requires owner confirmation): add new ones, or mark an existing one improving / worsened / resolved.",
            parameters: z.object({
              petName: z.string().optional(),
              changes: z
                .array(
                  z.object({
                    name: z.string(),
                    severity: z
                      .enum(["mild", "moderate", "severe", "unknown"])
                      .optional(),
                    status: z.enum([
                      "present",
                      "improving",
                      "worsened",
                      "resolved",
                    ]),
                  }),
                )
                .min(1),
            }),
            execute: async ({ petName, changes }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              const summary = changes
                .map((c) => `${c.name} → ${c.status}`)
                .join(", ");
              return emit("update_symptoms", d, `Update symptoms for ${d.petName}: ${summary}`, {
                endpoint: `/api/pets/${d.petId}/symptoms/reconcile`,
                payload: { symptoms: changes },
              });
            },
          }),
          propose_create_pet: tool({
            description:
              "Prepare creating a new pet profile (requires owner confirmation). Use when the owner wants to add a pet — especially their first one. Collect name, species (Dog or Cat), breed, age, and weight before calling; ask for any missing field one at a time. Weight is in kg; if the owner gives lb, convert it.",
            parameters: z.object({
              pet_name: z.string(),
              species: z.enum(["Dog", "Cat"]),
              breed: z.string(),
              age_years: z.number().int().min(0).max(25),
              age_months: z.number().int().min(0).max(11).optional(),
              weight_kg: z.number().positive(),
              medical_conditions: z
                .array(z.string())
                .optional()
                .describe("Known ongoing conditions, if any"),
            }),
            execute: async (p) => {
              const detail = `${p.species} · ${p.breed} · ${p.age_years}y${
                p.age_months ? ` ${p.age_months}m` : ""
              } · ${p.weight_kg}kg`;
              return emitAction(
                "create_pet",
                "",
                p.pet_name,
                `Create pet "${p.pet_name}" (${detail})`,
                {
                  endpoint: `/api/pets`,
                  payload: { ...p, medical_conditions: p.medical_conditions ?? [] },
                },
              );
            },
          }),
          propose_start_assessment: tool({
            description:
              "Offer to start a guided symptom assessment for a pet (shows a Start button).",
            parameters: z.object({ petName: z.string().optional() }),
            execute: async ({ petName }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              return emit(
                "start_assessment",
                d,
                `Start a new assessment for ${d.petName}`,
                { href: `/assessment/${d.petId}` },
              );
            },
          }),
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
