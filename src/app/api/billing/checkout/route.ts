import { NextResponse } from "next/server";

import { createPremiumCheckoutSession } from "@/lib/billing/checkout";
import { billingRateLimiter } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/billing/checkout — start a PitsyPremium subscription. Creates a
// Stripe Checkout Session (Stripe-hosted payment page) and returns its URL;
// the client just navigates there. The upgrade itself is applied later by the
// webhook / success-redirect confirmation, never trusted from the client.
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
    .select("plan, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.plan === "premium") {
    return NextResponse.json(
      { error: "You are already on PitsyPremium." },
      { status: 400 },
    );
  }

  try {
    const session = await createPremiumCheckoutSession({
      userId: user.id,
      email: user.email ?? null,
      customerId: profile?.stripe_customer_id ?? null,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing] checkout session failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }
}
