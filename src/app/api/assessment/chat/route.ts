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
import { formatSymptoms, formatPet, formatChunks } from "@/lib/ai/format";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  let body: { assessmentId?: string; petId?: string; messages?: Message[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { assessmentId, petId, messages } = body;
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

  let symptoms: ExtractedSymptom[] = [];
  let complete = false;
  let confidence = 0;
  const startedAt = Date.now();

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: anthropic("claude-haiku-4-5-20251001"),
        system: EXTRACTION_SYSTEM_PROMPT,
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
          // Persist server-side — fires even if the client disconnects.
          const turn = [
            ...messages,
            {
              role: "assistant",
              content: text,
              createdAt: new Date().toISOString(),
            },
          ];
          const update: Database["public"]["Tables"]["assessments"]["Update"] = {
            conversation_log: turn as unknown as Json,
            extracted_symptoms: symptoms as unknown as Json,
            confidence_score: confidence, // logged only
            tokens_used: usage?.totalTokens ?? 0,
          };

          if (complete) {
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
            );
            dataStream.writeData({
              type: "classification",
              classification,
            } as unknown as JSONValue);
            update.risk_classification = classification.riskLevel;
            update.confidence_score = classification.confidenceScore;
            update.primary_concern = classification.primaryConcern;
            update.clinical_reasoning = classification.clinicalReasoning;
            update.recommended_action = classification.recommendedAction;
            update.about_symptoms = classification.aboutSymptoms;
            update.red_flags = classification.redFlags;
            update.rag_chunks_used = chunks.map((c) => ({
              source: c.source,
              chunk_id: c.chunk_id,
            })) as unknown as Json;
            update.fallback_used = classification.fallbackUsed;
            update.model_version = "sonnet-4-6 / haiku-4-5";
            update.completed_at = new Date().toISOString();
            update.processing_time_ms = Date.now() - startedAt;
            await incrementDailyAssessmentCount();
          }

          await supabase
            .from("assessments")
            .update(update)
            .eq("assessment_id", assessmentId);
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
