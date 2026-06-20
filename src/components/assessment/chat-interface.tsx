"use client";

import { useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ExtractedSymptom, RiskClassification } from "@/lib/ai/schemas";
import { SymptomSidebar } from "@/components/assessment/symptom-sidebar";
import { ProgressIndicator } from "@/components/assessment/progress-indicator";

type RiskResult = RiskClassification & { fallbackUsed?: boolean };

// Pull the latest symptoms + classification out of the useChat data stream.
function readStream(data: unknown[] | undefined): {
  symptoms: ExtractedSymptom[];
  classification: RiskResult | null;
} {
  let symptoms: ExtractedSymptom[] = [];
  let classification: RiskResult | null = null;
  for (const part of data ?? []) {
    if (part && typeof part === "object" && "type" in part) {
      const p = part as {
        type: string;
        symptoms?: ExtractedSymptom[];
        classification?: RiskResult;
      };
      if (p.type === "symptoms" && Array.isArray(p.symptoms)) symptoms = p.symptoms;
      if (p.type === "classification" && p.classification)
        classification = p.classification;
    }
  }
  return { symptoms, classification };
}

function quickReplies(text: string): string[] {
  const t = text.toLowerCase();
  if (/\b(when|start|began|begin|how long)\b/.test(t))
    return ["Today", "Yesterday", "A few days ago", "Over a week ago"];
  if (/how often|how many times|frequency|times (a day|today)/.test(t))
    return ["Once", "2–3 times", "5+ times"];
  if (/how (severe|bad)|severity|mild, moderate/.test(t))
    return ["Mild", "Moderate", "Severe"];
  if (/any other|anything else|other symptom/.test(t))
    return ["No other symptoms", "Yes, there's more"];
  return [];
}

const RISK_STYLES: Record<string, string> = {
  High: "border-destructive/30 bg-destructive/10 text-destructive",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Low: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
};

export function ChatInterface({
  petId,
  assessmentId,
  petName,
}: {
  petId: string;
  assessmentId: string;
  petName: string;
}) {
  const { messages, input, handleInputChange, handleSubmit, append, data, isLoading } =
    useChat({
      api: "/api/assessment/chat",
      body: { assessmentId, petId },
      initialMessages: [
        {
          id: "greeting",
          role: "assistant",
          content: `Hi! I'm here to help check on ${petName}. What symptoms have you noticed?`,
        },
      ],
    });

  const { symptoms, classification } = useMemo(() => readStream(data), [data]);
  const lastMessage = messages[messages.length - 1];
  const replies =
    !isLoading && !classification && lastMessage?.role === "assistant"
      ? quickReplies(lastMessage.content)
      : [];

  const stage: 0 | 1 | 2 = classification ? 2 : isLoading && symptoms.length > 0 ? 1 : 0;
  const analyzing = isLoading && symptoms.length > 0 && !classification;

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, classification]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="grid content-start gap-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-xl font-semibold">
            {petName}&apos;s assessment
          </h1>
          <ProgressIndicator stage={stage} />
        </div>

        <div
          className="grid gap-3 rounded-xl border p-4"
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
          <div ref={bottomRef} />
        </div>

        {classification && (
          <div className="grid gap-3">
            <div
              className={cn(
                "rounded-xl border px-4 py-3",
                RISK_STYLES[classification.riskLevel] ?? "border-border",
              )}
            >
              <p className="font-heading font-semibold">
                {classification.riskLevel} Risk
              </p>
              <p className="mt-1 text-sm">{classification.primaryConcern}</p>
            </div>
            <div className="rounded-xl border p-4 text-sm">
              <p className="font-medium">What this means</p>
              <p className="mt-1 text-muted-foreground">
                {classification.clinicalReasoning}
              </p>
              <p className="mt-3 font-medium">Recommended action</p>
              <p className="mt-1 text-muted-foreground">
                {classification.recommendedAction}
              </p>
              {classification.redFlags.length > 0 && (
                <>
                  <p className="mt-3 font-medium">When to seek care</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {classification.redFlags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                PitsyPet is an educational tool, not a diagnosis. In a suspected
                emergency, contact a vet immediately.
              </p>
            </div>
            {/* TODO(Phase 6): replace this inline panel with a redirect to the
                full /assessment/[id]/results page (risk badge, first-aid,
                emergency contacts, save-to-history). */}
          </div>
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
            <Button type="submit" disabled={isLoading || input.trim().length === 0}>
              {isLoading ? "…" : "Send"}
            </Button>
          </form>
        )}
      </div>

      <SymptomSidebar symptoms={symptoms} analyzing={analyzing} />
    </div>
  );
}
