"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = ["Describing Symptoms", "Checking Guidelines", "Risk Assessment"];

// stage: 0 = chatting, 1 = analyzing, 2 = result ready.
export function ProgressIndicator({ stage }: { stage: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Assessment progress">
      {STEPS.map((label, i) => {
        const done = stage > i || (stage === 2 && i === 2);
        const active = stage === i;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border text-xs",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : active
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                done || active ? "text-foreground" : "text-muted-foreground",
                "hidden sm:inline",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-4 bg-border sm:w-8" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
