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

import type { Database, Json } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { chatRateLimiter } from "@/lib/rate-limit";
import { checkDailyCap, incrementDailyAssessmentCount } from "@/lib/cost-guard";
import { RecordSymptomsSchema, type ExtractedSymptom } from "@/lib/ai/schemas";
import { retrieveKnowledge } from "@/lib/ai/rag";
import { classifyRisk } from "@/lib/ai/classifier";
import {
  formatSymptoms,
  formatPet,
  formatChunks,
  formatClinicalContext,
} from "@/lib/ai/format";

export const runtime = "nodejs";
export const maxDuration = 60;

// Pull symptom names out of a stored extracted_symptoms JSON array.
function extractNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) =>
      s && typeof s === "object" && "name" in s
        ? String((s as { name: unknown }).name)
        : null,
    )
    .filter((n): n is string => !!n);
}

const EXTRACTION_SYSTEM_PROMPT = `You are a veterinary triage assistant helping a pet owner describe their pet's symptoms.

HOW TO RESPOND — every single turn you MUST do BOTH:
A) Write a short reply to the owner in plain text (2–4 sentences) and ask ONE follow-up question. This visible message is the most important part — NEVER leave it empty and never reply with only a tool call.
B) In the same response, also call the record_symptoms tool to record structured data in the background: the symptoms gathered so far, the current isComplete value, and 2–4 suggestedReplies that directly answer the question you just asked (use an empty array when the owner should type freely, e.g. when first describing the symptom).

What to gather, in priority order: what the symptom is, when it started, how severe, any other symptoms.

Completing the assessment:
- Confirm first. Once you have at least one named symptom, onset, and a severity estimate, do NOT set isComplete yet — first ask one confirmation question, e.g. "Thanks — is there anything else about <pet> you'd like to add, or should I assess now?" (suggestedReplies: "That's everything", "Yes, there's more"). Set isComplete to true only after the owner confirms there's nothing more (or asks you to assess).
- EMERGENCY OVERRIDE (this beats the confirmation step): if the owner describes difficulty breathing, blue gums or tongue, collapse, seizure/fitting, unresponsiveness, a swollen belly with retching, straining to urinate with no output, or suspected poisoning/trauma — still write a brief reply telling them to seek emergency care now, set isComplete to true immediately, and skip the confirmation question.

Other rules:
- Only discuss the pet's health. If the message is about anything else, reply in text: "I can only help with your pet's health. Could you describe what symptoms you're noticing?"
- Plain English, no clinical jargon unless you explain it.`;

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    assessmentId?: string;
    petId?: string;
    messages?: Message[];
    isFollowUp?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { assessmentId, petId, messages, isFollowUp } = body;
  if (!assessmentId || !petId || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Global daily cost cap (bounds total spend; per-user limit alone does not).
  if (await checkDailyCap()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable — please try again later." },
      { status: 503 },
    );
  }

  // Per-user rate limit.
  const { success } = await chatRateLimiter.limit(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests — please slow down." },
      { status: 429 },
    );
  }

  // Re-fetch the pet through the cookie-scoped client — never trust client data.
  const { data: pet } = await supabase
    .from("pets")
    .select(
      "pet_name, species, breed, age_years, age_months, weight_kg, medical_conditions",
    )
    .eq("pet_id", petId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const petForFormat = {
    ...pet,
    medical_conditions: Array.isArray(pet.medical_conditions)
      ? pet.medical_conditions.filter((c): c is string => typeof c === "string")
      : [],
  };

  // Clinical context for the AI: current medications + prior completed
  // assessments (so it can build on earlier findings, e.g. a vet visit between
  // then and now). Conditions are already in formatPet via medical_conditions.
  const [
    { data: medRows },
    { data: priorRows },
    { data: apptRows },
    { data: activeSymptomRows },
  ] = await Promise.all([
    supabase
      .from("medications")
      .select("name, dosage, frequency, started_at, ended_at, active")
      .eq("pet_id", petId)
      .is("deleted_at", null)
      .order("active", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("assessments")
      .select(
        "created_at, risk_classification, primary_concern, recommended_action, extracted_symptoms",
      )
      .eq("pet_id", petId)
      .not("completed_at", "is", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("appointments")
      .select("title, scheduled_at, reason, notes, outcome")
      .eq("pet_id", petId)
      .is("deleted_at", null)
      .order("scheduled_at", { ascending: false })
      .limit(10),
    supabase
      .from("active_symptoms")
      .select("name, severity, status, detected_at")
      .eq("pet_id", petId)
      .in("status", ["active", "worsened"])
      .is("deleted_at", null)
      .order("detected_at", { ascending: false }),
  ]);

  const clinicalContext = formatClinicalContext(
    (medRows ?? []).map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      started_at: m.started_at,
      ended_at: m.ended_at,
      active: m.active,
    })),
    (priorRows ?? []).map((a) => ({
      created_at: a.created_at,
      risk_classification: a.risk_classification,
      primary_concern: a.primary_concern,
      recommended_action: a.recommended_action,
      symptomNames: extractNames(a.extracted_symptoms),
    })),
    (apptRows ?? []).map((a) => ({
      title: a.title,
      scheduled_at: a.scheduled_at,
      reason: a.reason,
      notes: a.notes,
      outcome: a.outcome,
    })),
    (activeSymptomRows ?? []).map((s) => ({
      name: s.name,
      severity: s.severity,
      status: s.status,
      detected_at: s.detected_at,
    })),
  );

  const followUpNote = isFollowUp
    ? "\n\nThis is a FOLLOW-UP to a previous assessment for this pet (see prior assessments above). Acknowledge the earlier visit, ask how the pet has responded since then (including to any treatment or medication), and focus on what has changed."
    : "";
  const systemPrompt = clinicalContext
    ? `${EXTRACTION_SYSTEM_PROMPT}\n\nBackground on this patient (context only — still gather the CURRENT symptoms from the owner):\n${clinicalContext}${followUpNote}`
    : `${EXTRACTION_SYSTEM_PROMPT}${followUpNote}`;

  let symptoms: ExtractedSymptom[] = [];
  let complete = false;
  let confidence = 0;
  const startedAt = Date.now();

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: anthropic("claude-haiku-4-5-20251001"),
        system: systemPrompt,
        messages: convertToCoreMessages(messages),
        maxSteps: 1,
        tools: {
          record_symptoms: tool({
            description:
              "Record the structured symptoms extracted so far and whether enough detail has been gathered.",
            parameters: RecordSymptomsSchema,
            execute: async (data) => {
              symptoms = data.extractedSymptoms;
              complete = data.isComplete;
              confidence = data.confidenceScore;
              dataStream.writeData({
                type: "symptoms",
                symptoms,
                suggestedReplies: data.suggestedReplies,
              } as unknown as JSONValue);
              return "ok";
            },
          }),
        },
        onFinish: async ({ text, usage }) => {
          // Only finalized assessments are persisted. An incomplete turn never
          // touches the DB, so abandoning/refreshing mid-chat leaves no orphan
          // rows. (confidence stays logged-only; referenced here to satisfy
          // no-unused-vars and keep it available if we ever log partials.)
          void confidence;
          if (!complete) return;

          const turn = [
            ...messages,
            {
              role: "assistant",
              content: text,
              createdAt: new Date().toISOString(),
            },
          ];

          const chunks = await retrieveKnowledge(
            supabase,
            symptoms.map((s) => s.name),
            pet.species,
            pet.breed,
          );
          const classification = await classifyRisk(
            formatSymptoms(symptoms),
            formatPet(petForFormat),
            formatChunks(chunks),
            clinicalContext,
          );
          dataStream.writeData({
            type: "classification",
            classification,
          } as unknown as JSONValue);

          await incrementDailyAssessmentCount();

          // Keep the active-symptoms tracker in sync: add newly detected
          // symptoms not already tracked as active/worsened. Best-effort.
          try {
            const { data: existing } = await supabase
              .from("active_symptoms")
              .select("name")
              .eq("pet_id", petId)
              .in("status", ["active", "worsened"])
              .is("deleted_at", null);
            const have = new Set(
              (existing ?? []).map((r) => r.name.trim().toLowerCase()),
            );
            const today = new Date().toISOString().slice(0, 10);
            const seen = new Set<string>();
            const toInsert = symptoms
              .filter((s) => {
                const key = s.name?.trim().toLowerCase();
                if (!key || have.has(key) || seen.has(key)) return false;
                seen.add(key);
                return true;
              })
              .map((s) => ({
                pet_id: petId,
                user_id: user.id,
                name: s.name,
                severity: s.severity,
                status: "active",
                source: isFollowUp ? "followup" : "assessment",
                detected_at: today,
              }));
            if (toInsert.length > 0) {
              await supabase.from("active_symptoms").insert(toInsert);
            }
          } catch {
            // non-fatal — never block results on tracker sync
          }

          if (isFollowUp) {
            // Append a dated section to the existing assessment — never edit the
            // original snapshot. RLS scopes the read/update to the owner.
            const { data: existing } = await supabase
              .from("assessments")
              .select("follow_ups")
              .eq("assessment_id", assessmentId)
              .single();
            const prior = Array.isArray(existing?.follow_ups)
              ? (existing!.follow_ups as unknown[])
              : [];
            const section = {
              created_at: new Date().toISOString(),
              conversation_log: turn,
              extracted_symptoms: symptoms,
              risk_classification: classification.riskLevel,
              confidence_score: classification.confidenceScore,
              primary_concern: classification.primaryConcern,
              clinical_reasoning: classification.clinicalReasoning,
              recommended_action: classification.recommendedAction,
              about_symptoms: classification.aboutSymptoms,
              red_flags: classification.redFlags,
            };
            await supabase
              .from("assessments")
              .update({
                follow_ups: [...prior, section] as unknown as Json,
              })
              .eq("assessment_id", assessmentId);
            return;
          }

          const row: Database["public"]["Tables"]["assessments"]["Insert"] = {
            assessment_id: assessmentId,
            pet_id: petId,
            user_id: user.id,
            conversation_log: turn as unknown as Json,
            extracted_symptoms: symptoms as unknown as Json,
            confidence_score: classification.confidenceScore, // logged only
            tokens_used: usage?.totalTokens ?? 0,
            risk_classification: classification.riskLevel,
            primary_concern: classification.primaryConcern,
            clinical_reasoning: classification.clinicalReasoning,
            recommended_action: classification.recommendedAction,
            about_symptoms: classification.aboutSymptoms,
            red_flags: classification.redFlags as unknown as Json,
            rag_chunks_used: chunks.map((c) => ({
              source: c.source,
              chunk_id: c.chunk_id,
            })) as unknown as Json,
            fallback_used: classification.fallbackUsed,
            model_version: "sonnet-4-6 / haiku-4-5",
            completed_at: new Date().toISOString(),
            processing_time_ms: Date.now() - startedAt,
          };

          await supabase
            .from("assessments")
            .upsert(row, { onConflict: "assessment_id" });
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
