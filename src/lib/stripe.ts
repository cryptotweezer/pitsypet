import Stripe from "stripe";

// Server-only Stripe client. Test vs live mode is decided entirely by which
// key is in STRIPE_SECRET_KEY (sk_test_… vs sk_live_…) — switching to real
// payments is an env-var swap, no code change.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe ??= new Stripe(key);
  return _stripe;
}

// The PitsyPremium monthly price is found (or created on first use) by this
// stable lookup key, so there is ZERO manual product setup in the Stripe
// dashboard — in test mode AND again in live mode. Amount matches the landing
// pricing section ($9.99/month, AUD — Australian product).
const PREMIUM_LOOKUP_KEY = "pitsypet_premium_monthly";
let _premiumPriceId: string | null = null;

export async function getPremiumPriceId(): Promise<string> {
  if (_premiumPriceId) return _premiumPriceId;
  const stripe = getStripe();

  const existing = await stripe.prices.list({
    lookup_keys: [PREMIUM_LOOKUP_KEY],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) {
    _premiumPriceId = existing.data[0].id;
    return _premiumPriceId;
  }

  const price = await stripe.prices.create({
    currency: "aud",
    unit_amount: 999,
    recurring: { interval: "month" },
    lookup_key: PREMIUM_LOOKUP_KEY,
    product_data: { name: "PitsyPremium" },
  });
  _premiumPriceId = price.id;
  return _premiumPriceId;
}
