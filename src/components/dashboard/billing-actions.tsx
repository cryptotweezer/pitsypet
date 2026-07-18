"use client";

import { useState } from "react";
import { ArrowRight, ReceiptText } from "lucide-react";
import { toast } from "sonner";

// Both actions just ask our API for a Stripe-hosted URL (Checkout / Customer
// Portal) and navigate there — no card data ever touches our pages.
async function goToStripe(endpoint: string, setBusy: (b: boolean) => void) {
  setBusy(true);
  try {
    const res = await fetch(endpoint, { method: "POST" });
    const data = (await res.json().catch(() => null)) as {
      url?: string;
      error?: string;
    } | null;
    if (!res.ok || !data?.url) {
      toast.error(data?.error ?? "Something went wrong. Please try again.");
      return;
    }
    window.location.href = data.url;
  } catch {
    toast.error("Something went wrong. Please try again.");
  } finally {
    setBusy(false);
  }
}

export function UpgradeButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => goToStripe("/api/billing/checkout", setBusy)}
      className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand/20 transition-all hover:scale-[1.02] hover:bg-brand/90 disabled:opacity-60"
    >
      {busy ? "Opening checkout…" : "Go Premium"}
      <ArrowRight className="size-4" aria-hidden />
    </button>
  );
}

export function ManageBillingButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => goToStripe("/api/billing/portal", setBusy)}
      className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-white px-6 py-3 text-sm font-bold text-brand transition-all hover:bg-muted disabled:opacity-60"
    >
      <ReceiptText className="size-4" aria-hidden />
      {busy ? "Opening portal…" : "Manage subscription & invoices"}
    </button>
  );
}
