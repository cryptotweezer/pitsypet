import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { billingRateLimiter } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/billing/portal — open the Stripe Customer Portal (Stripe-hosted):
// payment history, invoice PDF downloads, card update, cancel subscription.
// Only meaningful for users who have a Stripe customer record.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { success } = await billingRateLimiter.limit(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests — please try again shortly." },
      { status: 429 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing history yet." },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();
  const params: Stripe.BillingPortal.SessionCreateParams = {
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/dashboard/billing`,
  };

  try {
    const session = await stripe.billingPortal.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    // A brand-new Stripe account has no default portal configuration saved.
    // Create one via the API (invoices + card update + cancel) and retry, so
    // there is no manual dashboard step in test OR live mode.
    if (
      err instanceof Error &&
      /default configuration|no configuration/i.test(err.message)
    ) {
      try {
        const config = await stripe.billingPortal.configurations.create({
          features: {
            invoice_history: { enabled: true },
            payment_method_update: { enabled: true },
            subscription_cancel: { enabled: true, mode: "at_period_end" },
          },
          business_profile: { headline: "PitsyPet — PitsyPremium" },
        });
        const session = await stripe.billingPortal.sessions.create({
          ...params,
          configuration: config.id,
        });
        return NextResponse.json({ url: session.url });
      } catch (retryErr) {
        console.error("[billing] portal config bootstrap failed:", retryErr);
      }
    } else {
      console.error("[billing] portal session failed:", err);
    }
    return NextResponse.json(
      { error: "Could not open the billing portal. Please try again." },
      { status: 502 },
    );
  }
}
