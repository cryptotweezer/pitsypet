"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export function SymptomSidebar({
  symptoms,
  analyzing,
}: {
  symptoms: ExtractedSymptom[];
  analyzing: boolean;
}) {
  return (
    <aside className="rounded-xl border p-4">
      <h2 className="font-heading text-sm font-semibold">Symptoms noticed</h2>

      {symptoms.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Symptoms will appear here as we chat.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {symptoms.map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="capitalize">{s.name}</span>
              <Badge variant={SEVERITY_VARIANT[s.severity] ?? "outline"}>
                {s.severity}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      {analyzing && (
        <div className="mt-4 grid gap-2" role="status" aria-live="polite">
          <p className="text-sm text-muted-foreground">Analyzing…</p>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      )}
    </aside>
  );
}
