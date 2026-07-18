import { redirect } from "next/navigation";
import { BadgeCheck, Check, Crown, PawPrint } from "lucide-react";

import {
  confirmCheckoutSession,
  reconcileFromStripe,
} from "@/lib/billing/subscription";
import { createPremiumCheckoutSession } from "@/lib/billing/checkout";
import { createClient } from "@/lib/supabase/server";
import {
  ManageBillingButton,
  UpgradeButton,
} from "@/components/dashboard/billing-actions";

export const metadata = { title: "Plan & billing · PitsyPet" };

const BASIC_FEATURES = [
  "2 AI triage sessions / month",
  "10 AI assistant messages / day",
  "Unlimited vet PDF exports",
  "1 pet profile",
  "Low / Medium / High risk assessment",
  "24/7 access, any device",
];

const PREMIUM_FEATURES = [
  "Everything in PitsyBasic",
  "Unlimited AI triage sessions",
  "Unlimited AI assistant chat",
  "Unlimited pets & clinical records",
  "Priority support",
];

type BillingProfile = {
  plan: string;
  plan_renews_at: string | null;
  plan_cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
} | null;

// Plan & billing. Payments and invoices are fully Stripe-hosted: "Go Premium"
// opens Stripe Checkout; "Manage subscription & invoices" opens the Customer
// Portal (payment history, invoice PDFs, card update, cancel).
export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
    upgraded?: string;
    canceled?: string;
    checkout?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  // Back from a successful Checkout: verify the session against Stripe and
  // apply the upgrade server-side. This makes local dev work without the
  // webhook; in prod the webhook usually got there first (the write is
  // idempotent either way). Then clean the URL.
  if (params.session_id) {
    let ok = false;
    try {
      ok = await confirmCheckoutSession(params.session_id, user.id);
    } catch (err) {
      console.error("[billing] checkout confirmation failed:", err);
    }
    redirect(ok ? "/dashboard/billing?upgraded=1" : "/dashboard/billing");
  }

  async function loadProfile(): Promise<BillingProfile> {
    const { data } = await supabase
      .from("profiles")
      .select(
        "plan, plan_renews_at, plan_cancel_at_period_end, stripe_customer_id",
      )
      .eq("id", user!.id)
      .maybeSingle();
    return data;
  }

  let profile = await loadProfile();

  // Self-heal: no billing state stored, but Stripe may still know this user
  // (missed webhook, lost success redirect). Syncing before anything else also
  // prevents offering checkout — and a second charge — to someone already paying.
  if (!profile?.stripe_customer_id) {
    try {
      if (await reconcileFromStripe(user.id)) {
        profile = await loadProfile();
      }
    } catch (err) {
      console.error("[billing] Stripe reconcile failed:", err);
    }
  }

  const isPremium = profile?.plan === "premium";

  // Landing "Go Premium" lands here with ?checkout=1: send the user straight
  // to the Stripe payment page (already-premium users just see their plan).
  if (params.checkout && !isPremium) {
    let checkoutUrl: string | null = null;
    try {
      const session = await createPremiumCheckoutSession({
        userId: user.id,
        email: user.email ?? null,
        customerId: profile?.stripe_customer_id ?? null,
      });
      checkoutUrl = session.url;
    } catch (err) {
      console.error("[billing] direct checkout failed:", err);
    }
    if (checkoutUrl) redirect(checkoutUrl);
  }

  const renewsAt = profile?.plan_renews_at
    ? new Date(profile.plan_renews_at).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="grid max-w-3xl gap-6">
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          PLAN &amp; BILLING
        </span>
        <h1 className="font-display text-3xl tracking-tight text-brand">
          Your plan
        </h1>
        <p className="font-light text-on-surface-variant">
          Payments and invoices are handled securely by Stripe. Your card
          details never touch PitsyPet.
        </p>
      </div>

      {params.upgraded && (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
          <BadgeCheck className="size-5 shrink-0" aria-hidden />
          Welcome to PitsyPremium! Your subscription is active.
        </div>
      )}
      {params.canceled && (
        <div className="rounded-[1.5rem] border border-outline-variant/30 bg-white px-5 py-4 text-sm font-light text-on-surface-variant">
          Checkout was cancelled — no charge was made.
        </div>
      )}

      {/* Current plan — always the top white card, explicitly marked. */}
      <div className="relative rounded-[2.5rem] border-2 border-brand/30 bg-white p-8 md:p-10">
        <span className="absolute -top-3 left-8 rounded-full bg-brand px-4 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
          Current plan
        </span>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isPremium ? (
              <Crown className="size-6 text-brand" aria-hidden />
            ) : (
              <PawPrint className="size-6 text-brand" aria-hidden />
            )}
            <h2 className="font-display text-2xl tracking-tight text-brand">
              {isPremium ? "PitsyPremium" : "PitsyBasic"}
            </h2>
          </div>
          <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-bold text-brand">
            {isPremium ? "$9.99 / month" : "Free"}
          </span>
        </div>

        {isPremium && renewsAt && (
          <p className="mt-2 text-sm font-light text-on-surface-variant">
            {profile?.plan_cancel_at_period_end
              ? `Your subscription is set to cancel on ${renewsAt}. You keep Premium until then.`
              : `Renews on ${renewsAt}.`}
          </p>
        )}

        <ul className="mt-6 grid gap-2.5">
          {(isPremium ? PREMIUM_FEATURES : BASIC_FEATURES).map((f) => (
            <li
              key={f}
              className="flex items-center gap-2.5 text-sm text-on-surface-variant"
            >
              <Check className="size-4 shrink-0 text-brand" aria-hidden />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {!isPremium && <UpgradeButton />}
          {profile?.stripe_customer_id && <ManageBillingButton />}
        </div>
        {profile?.stripe_customer_id && (
          <p className="mt-3 text-xs font-light text-on-surface-variant">
            Payment history, invoice PDF downloads, card changes and
            cancellation are all in the billing portal.
          </p>
        )}
      </div>

      {/* The other plan, below for reference. */}
      {isPremium ? (
        <div className="rounded-[2.5rem] border border-outline-variant/20 bg-white/60 p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PawPrint
                className="size-6 text-on-surface-variant/50"
                aria-hidden
              />
              <h2 className="font-display text-2xl tracking-tight text-on-surface-variant">
                PitsyBasic
              </h2>
            </div>
            <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-bold text-on-surface-variant">
              Free
            </span>
          </div>
          <ul className="mt-6 grid gap-2.5">
            {BASIC_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-on-surface-variant/70"
              >
                <Check
                  className="size-4 shrink-0 text-on-surface-variant/50"
                  aria-hidden
                />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs font-light text-on-surface-variant">
            If you cancel Premium, your account moves back to PitsyBasic at the
            end of the paid period.
          </p>
        </div>
      ) : (
        <div className="rounded-[2.5rem] border border-brand/20 bg-brand/5 p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Crown className="size-6 text-brand" aria-hidden />
              <h2 className="font-display text-2xl tracking-tight text-brand">
                PitsyPremium
              </h2>
            </div>
            <span className="rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white">
              $9.99 / month
            </span>
          </div>
          <p className="mt-2 text-sm font-light text-on-surface-variant">
            Everything unlimited. Cancel anytime.
          </p>
          <ul className="mt-5 grid gap-2.5">
            {PREMIUM_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-on-surface-variant"
              >
                <Check className="size-4 shrink-0 text-brand" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
