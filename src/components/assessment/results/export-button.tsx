"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

import type { ExportPayload } from "@/lib/export/types";

// Downloads a vet-facing PDF for one assessment (+ its follow-ups). The record
// + summary are assembled server-side from the STORED assessment (no AI call);
// the heavy @react-pdf renderer is dynamically imported here so it never ships
// in the page's initial bundle.
export function ExportButton({
  assessmentId,
  petName,
}: {
  assessmentId: string;
  petName: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessment/${assessmentId}/export`, {
        method: "POST",
      });
      if (!res.ok) {
        toast.error("Could not prepare the export. Please try again.");
        return;
      }
      const payload = (await res.json()) as ExportPayload;

      const [{ pdf }, { VetPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./vet-pdf-document"),
      ]);
      const blob = await pdf(<VetPdfDocument payload={payload} />).toBlob();

      const safeName = petName.replace(/[^\w-]+/g, "_") || "pet";
      const date = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}-triage-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Could not generate the PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-full border border-outline-variant/40 bg-white px-4 py-2 text-sm font-semibold text-brand transition-all hover:border-brand/40 active:scale-95 disabled:opacity-60"
    >
      <FileDown className="size-4" aria-hidden />
      {loading ? "Preparing…" : "Export for vet (PDF)"}
    </button>
  );
}
