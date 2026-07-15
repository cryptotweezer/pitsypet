"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type HistoryItem = {
  assessment_id: string;
  pet_name: string;
  risk_classification: string | null;
  primary_concern: string | null;
  created_at: string;
};

type SearchResult = HistoryItem & { relevance: number };

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

// Assessment history: shows every completed assessment by default, narrows by
// free-text search (symptom / concern / pet name, via the server RPC) and by a
// pet dropdown (client-side, on the pet's name).
export function HistorySearch({
  pets,
  initialItems,
}: {
  pets: { pet_id: string; pet_name: string }[];
  initialItems: HistoryItem[];
}) {
  const [query, setQuery] = useState("");
  const [petName, setPetName] = useState("all");
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

  const source: HistoryItem[] = searched ? results : initialItems;
  const visible =
    petName === "all" ? source : source.filter((r) => r.pet_name === petName);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by symptom, concern, or pet name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search assessment history"
            className="h-11 w-full rounded-full border border-outline-variant/30 bg-white pr-4 pl-11 text-sm outline-none transition-all focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
        {pets.length > 1 && (
          <select
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            aria-label="Filter history by pet"
            className="h-11 rounded-full border border-outline-variant/30 bg-white px-4 text-sm shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <option value="all">All pets</option>
            {pets.map((p) => (
              <option key={p.pet_id} value={p.pet_name}>
                {p.pet_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div className="grid gap-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )}

      {!loading && error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && visible.length === 0 && (
        <p className="rounded-[2rem] border border-dashed border-outline-variant/50 py-10 text-center text-sm font-light text-on-surface-variant">
          {hasQuery
            ? `No assessments match “${query.trim()}”.`
            : "No completed assessments yet."}
        </p>
      )}

      {!loading && !error && visible.length > 0 && (
        <ul className="grid gap-2">
          {visible.map((r) => {
            const risk = r.risk_classification ?? "—";
            return (
              <li key={r.assessment_id}>
                <Link
                  href={`/assessment/${r.assessment_id}/results?from=history`}
                  className="grid gap-1 rounded-2xl border border-outline-variant/20 bg-white p-4 transition-all hover:border-brand/20 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-brand">
                      {r.pet_name}
                    </span>
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
                  <p className="text-xs font-light text-on-surface-variant">
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
