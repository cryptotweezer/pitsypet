"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useChat } from "@ai-sdk/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, cleanAiText, parseApiError } from "@/lib/utils";
import type { ExtractedSymptom, RiskClassification } from "@/lib/ai/schemas";
import {
  SymptomSidebar,
  type KnownMedication,
  type KnownAppointment,
} from "@/components/assessment/symptom-sidebar";
import { ProgressIndicator } from "@/components/assessment/progress-indicator";
import { EmergencyFallback } from "@/components/assessment/emergency-fallback";
import {
  trackAssessmentStarted,
  trackAssessmentCompleted,
} from "@/lib/analytics";

// Reliability (proposal NFR-3): if a turn takes longer than this, surface the
// static emergency contacts so the owner is never stuck waiting on the AI. Set
// generously so normal latency (cold start, the RAG+classify finalize step)
// doesn't trip it — the analyzing/finishing phases are excluded below anyway.
const STALL_MS = 18_000;

type RiskResult = RiskClassification & { fallbackUsed?: boolean };

// Pull the latest symptoms + suggested replies + classification out of the
// useChat data stream. suggestedReplies come from the model itself, so the
// tappable buttons always match the question it just asked.
function readStream(data: unknown[] | undefined): {
  symptoms: ExtractedSymptom[];
  suggestedReplies: string[];
  classification: RiskResult | null;
} {
  let symptoms: ExtractedSymptom[] = [];
  let suggestedReplies: string[] = [];
  let classification: RiskResult | null = null;
  for (const part of data ?? []) {
    if (part && typeof part === "object" && "type" in part) {
      const p = part as {
        type: string;
        symptoms?: ExtractedSymptom[];
        suggestedReplies?: string[];
        classification?: RiskResult;
      };
      if (p.type === "symptoms") {
        if (Array.isArray(p.symptoms)) symptoms = p.symptoms;
        suggestedReplies = Array.isArray(p.suggestedReplies)
          ? p.suggestedReplies
          : [];
      }
      if (p.type === "classification" && p.classification)
        classification = p.classification;
    }
  }
  return { symptoms, suggestedReplies, classification };
}

export function ChatInterface({
  petId,
  petSlug,
  assessmentId,
  petName,
  isFollowUp = false,
  greeting,
  conditions = [],
  medications = [],
  appointments = [],
  initialSymptoms = [],
}: {
  petId: string;
  // The pet's URL slug — used for the "back to record" link.
  petSlug: string;
  assessmentId: string;
  petName: string;
  isFollowUp?: boolean;
  greeting?: string;
  conditions?: string[];
  medications?: KnownMedication[];
  // Upcoming (never past) appointments, shown in the sidebar.
  appointments?: KnownAppointment[];
  // The pet's already-tracked symptoms, shown before the AI's first turn.
  initialSymptoms?: ExtractedSymptom[];
}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    data,
    isLoading,
    error,
  } = useChat({
    api: "/api/assessment/chat",
    body: { assessmentId, petId, isFollowUp },
    initialMessages: [
      {
        id: "greeting",
        role: "assistant",
        content:
          greeting ??
          `Hi! I'm here to help check on ${petName}. What symptoms have you noticed?`,
      },
    ],
  });

  const { symptoms, suggestedReplies, classification } = useMemo(
    () => readStream(data),
    [data],
  );
  // Show the pre-loaded tracked symptoms until the AI streams its own (carried-
  // forward) list, so the panel is never empty when known symptoms exist.
  const displaySymptoms = symptoms.length > 0 ? symptoms : initialSymptoms;
  const lastMessage = messages[messages.length - 1];
  const replies =
    !isLoading && !classification && lastMessage?.role === "assistant"
      ? suggestedReplies
      : [];

  const stage: 0 | 1 | 2 = classification
    ? 2
    : isLoading && symptoms.length > 0
      ? 1
      : 0;
  const analyzing = isLoading && symptoms.length > 0 && !classification;

  // Once classified, the assessment is done: the AI posts a final message with a
  // link to the results and the chat locks (input + replies disappear). We do
  // NOT auto-redirect — the owner reads the AI's closing message, then chooses
  // when to open the results, so the last message is never lost to a redirect.
  // The closing message + link only appear once the stream has fully closed,
  // which means onFinish has persisted the row the results page reads back.
  const done = classification !== null && !isLoading;
  const finishing = classification !== null && isLoading;

  // If a turn stalls past STALL_MS, flag it so the static emergency fallback
  // shows. The timer only runs while waiting and is cleared once a reply lands.
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setStalled(false);
      return;
    }
    const t = setTimeout(() => setStalled(true), STALL_MS);
    return () => clearTimeout(t);
  }, [isLoading]);
  // Surface emergency contacts on an outright error, or a genuine stall before
  // results. NOT while we're actively producing results — `analyzing` (RAG +
  // classify running) and `finishing` (results streaming in) are normal working
  // states, not a stall, so showing the emergency block there is a false alarm
  // that flashes and then vanishes once the assessment lands.
  // A PitsyBasic allowance 403 is a business message, not a failure — it gets
  // its own upgrade notice and must NOT trigger the emergency-contacts block.
  const planLimitMessage =
    error != null && parseApiError(error).code === "plan_limit"
      ? parseApiError(error).message
      : null;
  const showEmergency =
    (error != null || stalled) &&
    planLimitMessage == null &&
    !done &&
    !analyzing &&
    !finishing;

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, classification]);

  // Analytics (Phase 11.2). Refs guard against double-firing (React strict mode
  // / re-renders) so each session counts once.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackAssessmentStarted({ isFollowUp });
  }, [isFollowUp]);

  const completedRef = useRef(false);
  useEffect(() => {
    if (!done || completedRef.current) return;
    completedRef.current = true;
    trackAssessmentCompleted({
      riskLevel: classification!.riskLevel,
      isFollowUp,
    });
  }, [done, classification, isFollowUp]);

  return (
    <div className="grid gap-6">
      {/* Header spans the full width so the chat box and the symptom sidebar
          below start at the same height. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <span className="block text-label-caps font-bold text-brand opacity-70">
            {isFollowUp ? "FOLLOW-UP" : "ASSESSMENT"}
          </span>
          <h1 className="font-display text-2xl tracking-tight text-brand md:text-3xl">
            {petName}&apos;s {isFollowUp ? "follow-up" : "assessment"}
          </h1>
          <Link
            href={`/pets/${petSlug}`}
            className="w-fit text-sm font-semibold text-brand hover:underline"
          >
            ← Back to {petName}&apos;s record
          </Link>
        </div>
        <ProgressIndicator stage={stage} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="grid content-start gap-4">
          <div
            className="grid max-h-[55vh] content-start gap-3 overflow-y-auto rounded-[2rem] border border-outline-variant/20 bg-white p-4 sm:p-5"
            aria-live="polite"
            aria-label="Conversation"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                  m.role === "user"
                    ? "justify-self-end bg-primary text-primary-foreground"
                    : "justify-self-start bg-muted",
                )}
              >
                {m.role === "assistant" ? cleanAiText(m.content) : m.content}
              </div>
            ))}
            {analyzing && (
              <div className="justify-self-start rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                Analyzing {petName}&apos;s symptoms…
              </div>
            )}
            {finishing && (
              <div className="justify-self-start rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                Preparing {petName}&apos;s results…
              </div>
            )}
            {done && (
              <div className="grid max-w-[85%] justify-items-start gap-2 justify-self-start rounded-2xl bg-muted px-3.5 py-2 text-sm">
                <p>
                  All done! I&apos;ve finished {petName}&apos;s{" "}
                  {isFollowUp ? "follow-up" : "assessment"}. You can view the
                  full results and recommendations whenever you&apos;re ready.
                </p>
                <Button
                  size="sm"
                  render={<Link href={`/assessment/${assessmentId}/results`} />}
                >
                  View {petName}&apos;s results
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {planLimitMessage && (
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm">
              <p className="text-on-surface-variant">{planLimitMessage}</p>
              <Button
                size="sm"
                className="mt-3"
                render={<Link href="/dashboard/billing?checkout=1" />}
              >
                Go Premium
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}

          {showEmergency && (
            <EmergencyFallback
              note={
                error != null
                  ? "Something went wrong with the assessment. If this might be an emergency, don't wait."
                  : undefined
              }
            />
          )}

          {replies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {replies.map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ role: "user", content: r })}
                >
                  {r}
                </Button>
              ))}
            </div>
          )}

          {!classification && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={`Describe ${petName}'s symptoms…`}
                disabled={isLoading}
                aria-label="Message"
              />
              <Button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
              >
                {isLoading ? "…" : "Send"}
              </Button>
            </form>
          )}
        </div>

        <div className="h-fit lg:sticky lg:top-6">
          <SymptomSidebar
            symptoms={displaySymptoms}
            analyzing={analyzing}
            conditions={conditions}
            medications={medications}
            appointments={appointments}
          />
        </div>
      </div>
    </div>
  );
}
