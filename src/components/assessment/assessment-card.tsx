import Link from "next/link";

import { cn } from "@/lib/utils";

export type AssessmentSummary = {
  assessment_id: string;
  pet_name: string;
  risk_classification: string | null;
  primary_concern: string | null;
  created_at: string;
};

const RISK_PILL: Record<string, string> = {
  High: "border-destructive/40 bg-destructive/10 text-destructive",
  Medium:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Low: "border-green-500/40 bg-green-600/10 text-green-700 dark:text-green-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AssessmentCard({ item }: { item: AssessmentSummary }) {
  const risk = item.risk_classification ?? "—";
  return (
    <Link
      href={`/assessment/${item.assessment_id}/results?from=history`}
      className="grid gap-2 rounded-xl border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{item.pet_name}</span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs font-medium",
            RISK_PILL[risk] ?? "text-muted-foreground",
          )}
        >
          {risk}
        </span>
      </div>
      {item.primary_concern && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.primary_concern}
        </p>
      )}
      <span className="text-xs text-muted-foreground">
        {formatDate(item.created_at)}
      </span>
    </Link>
  );
}
