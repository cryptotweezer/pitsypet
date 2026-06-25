"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SearchResult = {
  assessment_id: string;
  pet_name: string;
  risk_classification: string | null;
  primary_concern: string | null;
  created_at: string;
  relevance: number;
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

export function HistorySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancel an in-flight request when the query changes so results never arrive
  // out of order.
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      abortRef.current?.abort();
      setResults([]);
      setSearched(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setError(
            res.status === 429
              ? "Too many searches — please slow down."
              : "Search failed. Please try again.",
          );
          setResults([]);
        } else {
          const json = (await res.json()) as { results: SearchResult[] };
          setResults(json.results);
          setError(null);
        }
        setSearched(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError("Search failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="grid gap-4">
      <Input
        type="search"
        placeholder="Search by symptom, concern, or pet name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search assessment history"
        autoFocus
      />

      {loading && (
        <div className="grid gap-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!loading && !error && searched && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No assessments match “{query.trim()}”.
        </p>
      )}

      {!loading && results.length > 0 && (
        <ul className="grid gap-2">
          {results.map((r) => {
            const risk = r.risk_classification ?? "—";
            return (
              <li key={r.assessment_id}>
                <Link
                  href={`/assessment/${r.assessment_id}/results?from=history`}
                  className="grid gap-1 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{r.pet_name}</span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        RISK_PILL[risk] ?? "text-muted-foreground",
                      )}
                    >
                      {risk}
                    </span>
                  </div>
                  {r.primary_concern && (
                    <p className="line-clamp-2 text-sm">{r.primary_concern}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(r.created_at)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
