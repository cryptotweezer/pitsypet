import { NextResponse, type NextRequest } from "next/server";

import { handleStripeEvent } from "@/lib/billing/subscription";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/billing/webhook — Stripe server-to-server events. Public route
// (allow-listed in the auth middleware — Stripe has no session); its real
// authentication is the webhook signature: constructEvent() rejects any body
// not signed with STRIPE_WEBHOOK_SECRET, so a forged request can't flip
// anyone's plan. Handled events: checkout.session.completed,
// customer.subscription.updated, customer.subscription.deleted.
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[billing] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Signature verification needs the EXACT raw body, not re-serialized JSON.
  const payload = await request.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("[billing] webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    // Non-2xx makes Stripe retry with backoff — correct for transient DB/API
    // failures, since these events are how plans stay in sync.
    console.error(`[billing] webhook handler failed (${event.type}):`, err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
