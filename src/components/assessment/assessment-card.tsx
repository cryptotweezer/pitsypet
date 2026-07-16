import Link from "next/link";

import { cn, cleanAiText } from "@/lib/utils";

export type AssessmentSummary = {
  assessment_id: string;
  pet_name: string;
  risk_classification: string | null;
  primary_concern: string | null;
  recommended_action: string | null;
  symptoms: string[];
  follow_up_count: number;
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
      className="grid content-start gap-2 rounded-[2rem] border border-outline-variant/20 bg-white p-5 transition-all hover:border-brand/20 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-brand">{item.pet_name}</span>
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
        <p className="line-clamp-2 text-sm">{item.primary_concern}</p>
      )}

      {item.symptoms.length > 0 && (
        <p className="line-clamp-1 text-xs text-muted-foreground">
          <span className="font-medium">Symptoms:</span>{" "}
          {item.symptoms.join(", ")}
        </p>
      )}

      {item.recommended_action && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          <span className="font-medium">Next:</span>{" "}
          {cleanAiText(item.recommended_action)}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatDate(item.created_at)}</span>
        {item.follow_up_count > 0 && (
          <span>
            +{item.follow_up_count} follow-up
            {item.follow_up_count > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
