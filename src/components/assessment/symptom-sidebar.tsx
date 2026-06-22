"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ExtractedSymptom } from "@/lib/ai/schemas";

const SEVERITY_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  severe: "destructive",
  moderate: "default",
  mild: "secondary",
  unknown: "outline",
};

// How a symptom has changed over the conversation. "present" is the default and
// shows no tag; the rest get a small coloured label so the owner sees the AI
// picked up the change.
const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  improving: { text: "improving", className: "text-emerald-600" },
  worsened: { text: "worsened", className: "text-destructive" },
  resolved: { text: "resolved", className: "text-muted-foreground line-through" },
};

export type KnownMedication = {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
};

export function SymptomSidebar({
  symptoms,
  analyzing,
  conditions = [],
  medications = [],
}: {
  symptoms: ExtractedSymptom[];
  analyzing: boolean;
  conditions?: string[];
  medications?: KnownMedication[];
}) {
  return (
    <aside className="grid gap-4 rounded-xl border p-4">
      <div>
        <h2 className="font-heading text-sm font-semibold">Symptoms noticed</h2>

        {symptoms.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Symptoms will appear here as we chat.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {symptoms.map((s, i) => {
              const status = STATUS_LABEL[s.status ?? "present"];
              return (
                <li
                  key={`${s.name}-${i}`}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className={cn("capitalize", status?.className)}>
                    {s.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {status && (
                      <span className={cn("text-xs font-medium", status.className)}>
                        {status.text}
                      </span>
                    )}
                    <Badge variant={SEVERITY_VARIANT[s.severity] ?? "outline"}>
                      {s.severity}
                    </Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {analyzing && (
          <div className="mt-4 grid gap-2" role="status" aria-live="polite">
            <p className="text-sm text-muted-foreground">Analyzing…</p>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        )}
      </div>

      {/* Known context the AI already has — surfaced so the owner sees we're
          accounting for it. */}
      {(conditions.length > 0 || medications.length > 0) && (
        <div className="grid gap-3 border-t pt-3">
          {conditions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground">
                Known conditions
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {conditions.map((c, i) => (
                  <Badge key={`${c}-${i}`} variant="secondary">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {medications.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground">
                Current medications
              </h3>
              <ul className="mt-1.5 grid gap-1 text-sm">
                {medications.map((m, i) => {
                  const detail = [m.dosage, m.frequency]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <li key={`${m.name}-${i}`}>
                      <span className="font-medium">{m.name}</span>
                      {detail && (
                        <span className="text-muted-foreground"> — {detail}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
