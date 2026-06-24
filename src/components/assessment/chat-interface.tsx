"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useChat } from "@ai-sdk/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ExtractedSymptom, RiskClassification } from "@/lib/ai/schemas";
import {
  SymptomSidebar,
  type KnownMedication,
} from "@/components/assessment/symptom-sidebar";
import { ProgressIndicator } from "@/components/assessment/progress-indicator";

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
  assessmentId,
  petName,
  isFollowUp = false,
  greeting,
  conditions = [],
  medications = [],
  initialSymptoms = [],
}: {
  petId: string;
  assessmentId: string;
  petName: string;
  isFollowUp?: boolean;
  greeting?: string;
  conditions?: string[];
  medications?: KnownMedication[];
  // The pet's already-tracked symptoms, shown before the AI's first turn.
  initialSymptoms?: ExtractedSymptom[];
}) {
  const { messages, input, handleInputChange, handleSubmit, append, data, isLoading } =
    useChat({
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

  const stage: 0 | 1 | 2 = classification ? 2 : isLoading && symptoms.length > 0 ? 1 : 0;
  const analyzing = isLoading && symptoms.length > 0 && !classification;

  // Once classified, the assessment is done: the AI posts a final message with a
  // link to the results and the chat locks (input + replies disappear). We do
  // NOT auto-redirect — the owner reads the AI's closing message, then chooses
  // when to open the results, so the last message is never lost to a redirect.
  // The closing message + link only appear once the stream has fully closed,
  // which means onFinish has persisted the row the results page reads back.
  const done = classification !== null && !isLoading;
  const finishing = classification !== null && isLoading;

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, classification]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="grid content-start gap-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-xl font-semibold">
            {petName}&apos;s {isFollowUp ? "follow-up" : "assessment"}
          </h1>
          <ProgressIndicator stage={stage} />
        </div>

        <div
          className="grid max-h-[55vh] content-start gap-3 overflow-y-auto rounded-xl border p-4"
          aria-live="polite"
          aria-label="Conversation"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                m.role === "user"
                  ? "justify-self-end bg-primary text-primary-foreground"
                  : "justify-self-start bg-muted",
              )}
            >
              {m.content}
            </div>
          ))}
          {analyzing && (
            <div className="justify-self-start rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              Analyzing {petName}&apos;s symptoms…
            </div>
          )}
          {finishing && (
            <div className="justify-self-start rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              Preparing {petName}&apos;s results…
            </div>
          )}
          {done && (
            <div className="grid max-w-[85%] justify-items-start gap-2 justify-self-start rounded-lg bg-muted px-3 py-2 text-sm">
              <p>
                All done — I&apos;ve finished {petName}&apos;s{" "}
                {isFollowUp ? "follow-up" : "assessment"}. You can view the full
                results and recommendations whenever you&apos;re ready.
              </p>
              <Button
                size="sm"
                render={
                  <Link href={`/assessment/${assessmentId}/results`} />
                }
              >
                View {petName}&apos;s results
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

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
            <Button type="submit" disabled={isLoading || input.trim().length === 0}>
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
        />
      </div>
    </div>
  );
}
