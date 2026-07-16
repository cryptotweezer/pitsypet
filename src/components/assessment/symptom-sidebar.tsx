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

// An UPCOMING appointment (past ones never reach the sidebar).
export type KnownAppointment = {
  title: string;
  scheduled_at: string;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SymptomSidebar({
  symptoms,
  analyzing,
  conditions = [],
  medications = [],
  appointments = [],
}: {
  symptoms: ExtractedSymptom[];
  analyzing: boolean;
  conditions?: string[];
  medications?: KnownMedication[];
  appointments?: KnownAppointment[];
}) {
  return (
    <aside className="grid gap-4 rounded-[2rem] border border-outline-variant/20 bg-white p-5">
      <div>
        <h2 className="text-xs font-bold tracking-widest text-brand/60 uppercase">
          Symptoms noticed
        </h2>

        {symptoms.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Symptoms will appear here as we chat.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2.5">
            {symptoms.map((s, i) => {
              const status = STATUS_LABEL[s.status ?? "present"];
              return (
                // Name on its own line, tags underneath — long symptom names
                // wrap cleanly instead of colliding with the badges.
                <li key={`${s.name}-${i}`} className="grid gap-1">
                  <span
                    className={cn(
                      "text-sm capitalize",
                      s.status === "resolved" &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {s.name}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={SEVERITY_VARIANT[s.severity] ?? "outline"}>
                      {s.severity}
                    </Badge>
                    {status && (
                      <span
                        className={cn("text-xs font-medium", status.className)}
                      >
                        {status.text}
                      </span>
                    )}
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
      {(conditions.length > 0 ||
        medications.length > 0 ||
        appointments.length > 0) && (
        <div className="grid gap-3 border-t pt-3">
          {conditions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold tracking-widest text-brand/60 uppercase">
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
              <h3 className="text-xs font-bold tracking-widest text-brand/60 uppercase">
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
                        <span className="text-muted-foreground"> · {detail}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {appointments.length > 0 && (
            <div>
              <h3 className="text-xs font-bold tracking-widest text-brand/60 uppercase">
                Upcoming appointments
              </h3>
              <ul className="mt-1.5 grid gap-1 text-sm">
                {appointments.map((a, i) => (
                  <li key={`${a.title}-${i}`} className="grid">
                    <span className="font-medium">{a.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatWhen(a.scheduled_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
