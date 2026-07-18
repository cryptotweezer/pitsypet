import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

// Everything in this module runs strictly on Stripe-verified evidence — a
// signature-checked webhook event, or a Checkout session retrieved from
// Stripe's API and ownership-checked against the signed-in user. That is the
// contract that justifies the service-role write (see supabase/admin.ts).

// A subscription still counts as premium while Stripe retries a failed
// payment (`past_due`); it drops to basic once Stripe gives up or the user
// cancels. cancel_at_period_end keeps access until the paid period ends.
export function planFromStatus(status: string): "basic" | "premium" {
  return status === "active" || status === "trialing" || status === "past_due"
    ? "premium"
    : "basic";
}

// Stripe moved `current_period_end` from the subscription onto its items in
// newer API versions — read whichever is present.
export function subscriptionPeriodEnd(sub: Stripe.Subscription): string | null {
  const raw =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items?.data?.[0]?.current_period_end;
  return typeof raw === "number" ? new Date(raw * 1000).toISOString() : null;
}

type BillingUpdate = {
  plan: "basic" | "premium";
  stripe_customer_id?: string;
  stripe_subscription_id: string | null;
  plan_renews_at: string | null;
  plan_cancel_at_period_end: boolean;
};

function updateFromSubscription(sub: Stripe.Subscription): BillingUpdate {
  const plan = planFromStatus(sub.status);
  // Older API versions flag a scheduled cancellation with cancel_at_period_end;
  // newer ones (2025+/"dahlia") instead set `cancel_at` to the end timestamp
  // and leave the boolean false. Honour both, and when cancel_at is set it IS
  // the service-end date the user should see.
  const cancelScheduled = sub.cancel_at_period_end || sub.cancel_at != null;
  const endsAt = sub.cancel_at
    ? new Date(sub.cancel_at * 1000).toISOString()
    : subscriptionPeriodEnd(sub);
  return {
    plan,
    stripe_subscription_id: plan === "premium" ? sub.id : null,
    plan_renews_at: plan === "premium" ? endsAt : null,
    plan_cancel_at_period_end: plan === "premium" && cancelScheduled,
  };
}

// Upsert, not update: an UPDATE that matches 0 rows "succeeds" silently, and a
// missing profiles row (seen in the wild — signup-trigger gap) would swallow a
// PAID upgrade. Upserting by the auth user id can never lose the write.
async function applyByUserId(userId: string, update: BillingUpdate) {
  const { error } = await createAdminClient()
    .from("profiles")
    .upsert({ id: userId, ...update }, { onConflict: "id" });
  if (error) throw new Error(`billing: profile upsert failed — ${error.message}`);
}

async function applyByCustomerId(customerId: string, update: BillingUpdate) {
  const { data, error } = await createAdminClient()
    .from("profiles")
    .update(update)
    .eq("stripe_customer_id", customerId)
    .select("id");
  if (error) throw new Error(`billing: profile update failed — ${error.message}`);
  // 0 rows = we don't know this customer. Throw so the webhook returns non-2xx
  // and Stripe retries instead of the event vanishing.
  if (!data || data.length === 0) {
    throw new Error(`billing: no profile for Stripe customer ${customerId}`);
  }
}

// Webhook dispatcher. Unhandled event types are a no-op (Stripe sends many).
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await applyCheckoutSession(session);
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await applyByCustomerId(customerId, updateFromSubscription(sub));
      break;
    }
    default:
      break;
  }
}

async function applyCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id ?? session.client_reference_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  if (!userId || !customerId || !subId) return;

  const sub = await getStripe().subscriptions.retrieve(subId);
  await applyByUserId(userId, {
    ...updateFromSubscription(sub),
    stripe_customer_id: customerId,
  });
}

// Fallback for environments where the webhook can't reach us (local dev
// without the Stripe CLI): the success redirect carries the Checkout session
// id, and we verify it directly against Stripe's API before applying. Safe
// because the session is fetched from Stripe (not trusted from the client)
// and must belong to the signed-in user.
export async function confirmCheckoutSession(
  sessionId: string,
  userId: string,
): Promise<boolean> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return false;
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const sessionUser = session.metadata?.user_id ?? session.client_reference_id;
  if (sessionUser !== userId) return false;
  if (session.payment_status !== "paid" && session.status !== "complete") {
    return false;
  }
  await applyCheckoutSession(session);
  return true;
}

// Last-resort sync for a signed-in user whose profile has no billing state:
// ask Stripe directly whether an active subscription is pinned to this user
// id (subscription_data.metadata.user_id, set by our checkout route) and
// apply the newest one. Covers missed webhooks / lost success redirects, and
// stops a paid user from being offered checkout (and charged) twice. Cheap
// no-op for never-paid users; the billing page only calls it when the profile
// has no stripe_customer_id.
export async function reconcileFromStripe(userId: string): Promise<boolean> {
  const subs = await getStripe().subscriptions.list({
    status: "active",
    limit: 100,
  });
  const mine = subs.data
    .filter((s) => s.metadata?.user_id === userId)
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
  const sub = mine[0];
  if (!sub) return false;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  await applyByUserId(userId, {
    ...updateFromSubscription(sub),
    stripe_customer_id: customerId,
  });
  return true;
}
