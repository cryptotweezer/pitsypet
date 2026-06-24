"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ExportPayload } from "@/lib/export/types";

// Downloads a vet-facing PDF for one assessment (+ its follow-ups). The AI
// summary + record are assembled server-side; the heavy @react-pdf renderer is
// dynamically imported here so it never ships in the page's initial bundle.
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
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
    >
      <FileDown className="size-4" aria-hidden />
      {loading ? "Preparing…" : "Export for vet (PDF)"}
    </Button>
  );
}
