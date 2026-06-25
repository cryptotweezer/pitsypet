import { HistorySearch } from "@/components/history/history-search";

export const metadata = { title: "History · PitsyPet" };

// Dynamic so the page receives the middleware's per-request CSP nonce (our
// strict-dynamic script-src would block a build-time static page's scripts).
export const dynamic = "force-dynamic";

export default function HistoryPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Assessment history
        </h1>
        <p className="text-sm text-muted-foreground">
          Search across all your pets&apos; completed assessments — by symptom,
          concern, or pet name.
        </p>
      </div>
      <HistorySearch />
    </main>
  );
}
