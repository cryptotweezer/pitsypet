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
import {
  loadPetDossier,
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

const SYSTEM_PROMPT = `You are PitsyPet's assistant — a friendly, careful helper for a pet owner managing their pets' health records. You are NOT a vet and never give a diagnosis; for triage of new/worsening symptoms, offer to start an assessment, and for emergencies tell them to contact a vet now.

You can SEE each pet's full record below (conditions, active symptoms, medications, vet clinics + doctors, appointments, recent assessments). Use it to answer questions accurately and concretely.

WRITING TO THE RECORD — read carefully:
- You can NOT write to the database yourself. When the owner wants to add, change, or cancel something — a medication, appointment (add OR cancel), vet clinic, doctor, or a symptom update — you MUST call the matching propose_* tool. Calling the tool is what shows the owner the Confirm button.
- As soon as you have the fields, CALL THE TOOL in that same message. Do NOT ask "shall I confirm?" or "is this correct?" first — the tool's Confirm button IS the confirmation step, so a separate question just wastes a turn.
- NEVER tell the owner you've "prepared"/"registered"/"saved" anything unless you actually called the propose_* tool in that very message. If you didn't call the tool, you have done nothing yet. (Saying "Confirma abajo" without a tool call is a bug — there will be no button.)
- COLLECT EVERY FIELD of the thing you're recording before calling the tool. Ask for any field still missing, one short question at a time. Only leave a field blank if the owner says they don't have it or asks to skip it. The fields are:
  • Medication: name, dose amount, dose unit (mg/ml/mcg/g/IU/tablet…), quantity (e.g. "1 tablet", "30 capsules"), frequency, prescribed by, start date, end date (or mark ongoing), notes.
  • Appointment: title, date & time, clinic, reason, your notes.
  • Vet clinic: clinic name, phone, email, address, notes.
  • Doctor: clinic, name, specialty, phone, email, notes.
- For a medication's dose: always capture the amount AND its unit. If the owner gives a number with no unit, ask which unit.
- DATES: resolve relative dates yourself using today's date below — never ask the owner to reformat. "today"/"hoy" = today's date; "tomorrow"/"mañana" = +1 day; "in a week"/"en una semana" = +7 days; "next Monday", etc. ALWAYS pass dates to tools as YYYY-MM-DD (and appointment date-times as full ISO). Never pass words like "today" or "hoy" to a tool.
- To begin a symptom assessment, call propose_start_assessment (it shows a Start button).

Be concise and plain-spoken. One topic at a time.`;

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    scope?: "pet" | "dashboard";
    petId?: string;
    messages?: Message[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { scope, petId, messages } = body;
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
  const today = new Date().toISOString().slice(0, 10);
  const systemPrompt = `${SYSTEM_PROMPT}\n\nToday's date is ${today}. Use it to resolve any relative dates.\n\nThe owner's pet records:\n\n${recordsBlock}${scopeNote}`;

  // Each proposal emits a confirm card to the client and writes nothing itself.
  const proposals: ProposedAction[] = [];
  let counter = 0;

  return createDataStreamResponse({
    execute: (dataStream) => {
      function emit(
        kind: ProposedActionKind,
        d: PetDossier,
        summary: string,
        rest: Pick<ProposedAction, "endpoint" | "method" | "payload" | "href">,
      ): string {
        const action: ProposedAction = {
          id: `act-${Date.now()}-${counter++}`,
          kind,
          petId: d.petId,
          petName: d.petName,
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
              "Prepare adding a medication to a pet's record (requires owner confirmation). Use when the owner wants to record a medication. Split the dose into a numeric amount (dosage) and its unit (dosage_unit), e.g. '1.5 mg' → dosage '1.5', dosage_unit 'mg'. If the owner doesn't state a unit, ask which unit (mg, ml, mcg, g, tablet…).",
            parameters: z.object({
              petName: z.string().optional(),
              name: z.string(),
              dosage: z.string().optional(),
              dosage_unit: z
                .string()
                .optional()
                .describe("Unit of the dose, e.g. mg, ml, mcg, g, IU, tablet"),
              quantity: z.string().optional(),
              frequency: z.string().optional(),
              prescribed_by: z.string().optional(),
              started_at: z.string().optional(),
              ended_at: z.string().optional(),
              notes: z.string().optional(),
            }),
            execute: async ({ petName, ...m }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              const dose = [m.dosage, m.dosage_unit].filter(Boolean).join(" ");
              const detail = [dose, m.frequency].filter(Boolean).join(" · ");
              return emit(
                "add_medication",
                d,
                `Add medication "${m.name}"${detail ? ` (${detail})` : ""} for ${d.petName}`,
                {
                  endpoint: `/api/pets/${d.petId}/medications`,
                  payload: { ...m, active: true },
                },
              );
            },
          }),
          propose_add_appointment: tool({
            description:
              "Prepare adding a vet appointment (requires owner confirmation). scheduled_at must be an ISO datetime.",
            parameters: z.object({
              petName: z.string().optional(),
              title: z.string(),
              scheduled_at: z.string(),
              reason: z.string().optional(),
              notes: z.string().optional(),
              clinicName: z.string().optional(),
            }),
            execute: async ({ petName, clinicName, ...a }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              const clinic = clinicName
                ? d.clinics.find((c) => canon(c.name) === canon(clinicName))
                : undefined;
              const when = new Date(a.scheduled_at);
              const whenStr = Number.isNaN(when.getTime())
                ? a.scheduled_at
                : when.toLocaleString();
              return emit(
                "add_appointment",
                d,
                `Book "${a.title}" for ${d.petName} on ${whenStr}${clinic ? ` at ${clinic.name}` : ""}`,
                {
                  endpoint: `/api/pets/${d.petId}/appointments`,
                  payload: { ...a, vet_contact_id: clinic?.id },
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
              "Prepare adding a vet clinic to a pet's record (requires owner confirmation).",
            parameters: z.object({
              petName: z.string().optional(),
              clinic_name: z.string(),
              phone: z.string().optional(),
              email: z.string().optional(),
              address: z.string().optional(),
              notes: z.string().optional(),
            }),
            execute: async ({ petName, ...v }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              return emit(
                "add_vet_contact",
                d,
                `Add vet clinic "${v.clinic_name}" for ${d.petName}`,
                {
                  endpoint: `/api/pets/${d.petId}/vet-contacts`,
                  payload: v,
                },
              );
            },
          }),
          propose_add_doctor: tool({
            description:
              "Prepare adding a doctor to one of a pet's existing vet clinics (requires owner confirmation). The clinic must already exist.",
            parameters: z.object({
              petName: z.string().optional(),
              clinicName: z.string(),
              name: z.string(),
              specialty: z.string().optional(),
              phone: z.string().optional(),
              email: z.string().optional(),
              notes: z.string().optional(),
            }),
            execute: async ({ petName, clinicName, ...doc }) => {
              const d = needPet(petName);
              if (typeof d === "string") return d;
              const clinic = d.clinics.find(
                (c) => canon(c.name) === canon(clinicName),
              );
              if (!clinic)
                return `${d.petName} has no clinic called "${clinicName}". Existing clinics: ${
                  d.clinics.map((c) => c.name).join(", ") || "none"
                }. Add the clinic first, or pick an existing one.`;
              return emit(
                "add_doctor",
                d,
                `Add Dr ${doc.name}${doc.specialty ? ` (${doc.specialty})` : ""} to ${clinic.name} for ${d.petName}`,
                {
                  endpoint: `/api/pets/${d.petId}/vet-contacts/${clinic.id}/doctors`,
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
