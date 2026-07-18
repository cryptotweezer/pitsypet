import type Stripe from "stripe";

import { getPremiumPriceId, getStripe } from "@/lib/stripe";

// Shared by POST /api/billing/checkout and the billing page's direct-checkout
// flow (landing "Go Premium" → /dashboard/billing?checkout=1). The session is
// pinned to the auth user via metadata so completion/webhook/reconcile can
// never upgrade the wrong account.
export async function createPremiumCheckoutSession(opts: {
  userId: string;
  email: string | null;
  customerId: string | null;
}): Promise<Stripe.Checkout.Session> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: await getPremiumPriceId(), quantity: 1 }],
    // Reuse the stored customer so invoices accumulate on one record; for
    // first-time buyers Checkout creates the customer (persisted on
    // completion, so an abandoned checkout leaves nothing behind).
    customer: opts.customerId ?? undefined,
    customer_email: opts.customerId ? undefined : (opts.email ?? undefined),
    client_reference_id: opts.userId,
    metadata: { user_id: opts.userId },
    subscription_data: { metadata: { user_id: opts.userId } },
    success_url: `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
  });
}
