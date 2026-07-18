import { describe, it, expect, beforeEach, vi } from "vitest";

import { makeClient, jsonRequest } from "./_helpers";

let currentClient: unknown;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => currentClient,
}));

const mockLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  billingRateLimiter: { limit: (...args: unknown[]) => mockLimit(...args) },
}));

// The whole Stripe surface the routes touch, in one mock module.
const mockCheckoutCreate = vi.fn();
const mockCheckoutRetrieve = vi.fn();
const mockPortalCreate = vi.fn();
const mockConstructEvent = vi.fn();
const mockSubRetrieve = vi.fn();
const mockSubList = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: { create: mockCheckoutCreate, retrieve: mockCheckoutRetrieve },
    },
    billingPortal: { sessions: { create: mockPortalCreate } },
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubRetrieve, list: mockSubList },
  }),
  getPremiumPriceId: async () => "price_test_premium",
}));

// Service-role writes — capture every upsert/update so tests can assert
// exactly what the webhook persisted and by which filter.
type AdminUpdate = { values: Record<string, unknown>; filter: [string, unknown] };
let adminUpserts: Record<string, unknown>[] = [];
let adminUpdates: AdminUpdate[] = [];
let adminUpdateRows: { id: string }[] = [{ id: "row" }];
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: (values: Record<string, unknown>) => {
        adminUpserts.push(values);
        return Promise.resolve({ error: null });
      },
      update: (values: Record<string, unknown>) => ({
        eq: (col: string, val: unknown) => {
          adminUpdates.push({ values, filter: [col, val] });
          return {
            select: () => Promise.resolve({ data: adminUpdateRows, error: null }),
          };
        },
      }),
    }),
  }),
}));

import { POST as checkoutPOST } from "../billing/checkout/route";
import { POST as portalPOST } from "../billing/portal/route";
import { POST as webhookPOST } from "../billing/webhook/route";
import {
  planFromStatus,
  reconcileFromStripe,
  subscriptionPeriodEnd,
} from "@/lib/billing/subscription";
import type Stripe from "stripe";

beforeEach(() => {
  currentClient = undefined;
  adminUpserts = [];
  adminUpdates = [];
  adminUpdateRows = [{ id: "row" }];
  vi.clearAllMocks();
  mockLimit.mockResolvedValue({ success: true });
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

describe("POST /api/billing/checkout", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await checkoutPOST();
    expect(res.status).toBe(401);
  });

  it("429 when rate limited", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    mockLimit.mockResolvedValue({ success: false });
    const res = await checkoutPOST();
    expect(res.status).toBe(429);
  });

  it("400 when already premium", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { profiles: { data: { plan: "premium", stripe_customer_id: "cus_1" }, error: null } },
    });
    const res = await checkoutPOST();
    expect(res.status).toBe(400);
  });

  it("returns the Checkout URL and pins the session to the user", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { profiles: { data: { plan: "basic", stripe_customer_id: null }, error: null } },
    });
    mockCheckoutCreate.mockResolvedValue({ url: "https://checkout.stripe.com/c/x" });
    const res = await checkoutPOST();
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe("https://checkout.stripe.com/c/x");
    const args = mockCheckoutCreate.mock.calls[0]![0];
    expect(args.mode).toBe("subscription");
    expect(args.metadata.user_id).toBe("u1");
    expect(args.subscription_data.metadata.user_id).toBe("u1");
  });

  it("502 when Stripe errors", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { profiles: { data: { plan: "basic", stripe_customer_id: null }, error: null } },
    });
    mockCheckoutCreate.mockRejectedValue(new Error("stripe down"));
    const res = await checkoutPOST();
    expect(res.status).toBe(502);
  });
});

describe("POST /api/billing/portal", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await portalPOST();
    expect(res.status).toBe(401);
  });

  it("400 when the user has no Stripe customer yet", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { profiles: { data: { stripe_customer_id: null }, error: null } },
    });
    const res = await portalPOST();
    expect(res.status).toBe(400);
  });

  it("returns the portal URL for the stored customer", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { profiles: { data: { stripe_customer_id: "cus_1" }, error: null } },
    });
    mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/p/x" });
    const res = await portalPOST();
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe("https://billing.stripe.com/p/x");
    expect(mockPortalCreate.mock.calls[0]![0].customer).toBe("cus_1");
  });
});

describe("POST /api/billing/webhook", () => {
  const url = "http://localhost/api/billing/webhook";

  function signedRequest(body: unknown) {
    const req = jsonRequest(url, "POST", body);
    req.headers.set("stripe-signature", "t=1,v1=sig");
    return req;
  }

  it("400 when the signature header is missing", async () => {
    const res = await webhookPOST(jsonRequest(url, "POST", {}));
    expect(res.status).toBe(400);
  });

  it("400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const res = await webhookPOST(signedRequest({}));
    expect(res.status).toBe(400);
    expect(adminUpdates).toHaveLength(0);
  });

  it("checkout.session.completed upgrades the session's user to premium", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { user_id: "u1" },
          client_reference_id: "u1",
          customer: "cus_1",
          subscription: "sub_1",
        },
      },
    });
    mockSubRetrieve.mockResolvedValue({
      id: "sub_1",
      status: "active",
      cancel_at_period_end: false,
      items: { data: [{ current_period_end: 1_790_000_000 }] },
    });
    const res = await webhookPOST(signedRequest({}));
    expect(res.status).toBe(200);
    expect(adminUpserts).toHaveLength(1);
    expect(adminUpserts[0]).toMatchObject({
      id: "u1",
      plan: "premium",
      stripe_customer_id: "cus_1",
      stripe_subscription_id: "sub_1",
      plan_cancel_at_period_end: false,
    });
    expect(adminUpserts[0]!.plan_renews_at).toBe(
      new Date(1_790_000_000 * 1000).toISOString(),
    );
  });

  it("customer.subscription.deleted downgrades by customer id", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "canceled",
          cancel_at_period_end: false,
        },
      },
    });
    const res = await webhookPOST(signedRequest({}));
    expect(res.status).toBe(200);
    expect(adminUpdates[0]!.filter).toEqual(["stripe_customer_id", "cus_1"]);
    expect(adminUpdates[0]!.values).toMatchObject({
      plan: "basic",
      stripe_subscription_id: null,
      plan_renews_at: null,
    });
  });

  it("modern-API cancellation (cancel_at set, boolean false) marks the plan as cancelling", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "active",
          cancel_at_period_end: false,
          cancel_at: 1_790_000_000,
          items: { data: [{ current_period_end: 1_789_000_000 }] },
        },
      },
    });
    const res = await webhookPOST(signedRequest({}));
    expect(res.status).toBe(200);
    expect(adminUpdates[0]!.values).toMatchObject({
      plan: "premium",
      plan_cancel_at_period_end: true,
      plan_renews_at: new Date(1_790_000_000 * 1000).toISOString(),
    });
  });

  it("500 when a subscription event references an unknown customer (Stripe will retry)", async () => {
    adminUpdateRows = [];
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: { id: "sub_x", customer: "cus_unknown", status: "active", cancel_at_period_end: false, items: { data: [] } },
      },
    });
    const res = await webhookPOST(signedRequest({}));
    expect(res.status).toBe(500);
  });

  it("unhandled event types are acknowledged without writes", async () => {
    mockConstructEvent.mockReturnValue({ type: "invoice.finalized", data: { object: {} } });
    const res = await webhookPOST(signedRequest({}));
    expect(res.status).toBe(200);
    expect(adminUpdates).toHaveLength(0);
    expect(adminUpserts).toHaveLength(0);
  });
});

describe("reconcileFromStripe", () => {
  it("applies the NEWEST active subscription pinned to the user", async () => {
    mockSubList.mockResolvedValue({
      data: [
        { id: "sub_old", customer: "cus_old", status: "active", created: 100, cancel_at_period_end: false, metadata: { user_id: "u1" }, items: { data: [] } },
        { id: "sub_new", customer: "cus_new", status: "active", created: 200, cancel_at_period_end: false, metadata: { user_id: "u1" }, items: { data: [{ current_period_end: 1_790_000_000 }] } },
        { id: "sub_other", customer: "cus_z", status: "active", created: 300, cancel_at_period_end: false, metadata: { user_id: "someone-else" }, items: { data: [] } },
      ],
    });
    const applied = await reconcileFromStripe("u1");
    expect(applied).toBe(true);
    expect(adminUpserts).toHaveLength(1);
    expect(adminUpserts[0]).toMatchObject({
      id: "u1",
      plan: "premium",
      stripe_customer_id: "cus_new",
      stripe_subscription_id: "sub_new",
    });
  });

  it("returns false (no write) when Stripe has nothing for the user", async () => {
    mockSubList.mockResolvedValue({ data: [] });
    const applied = await reconcileFromStripe("u1");
    expect(applied).toBe(false);
    expect(adminUpserts).toHaveLength(0);
  });
});

describe("billing plan helpers", () => {
  it("premium while active, trialing, or in past_due retry grace", () => {
    expect(planFromStatus("active")).toBe("premium");
    expect(planFromStatus("trialing")).toBe("premium");
    expect(planFromStatus("past_due")).toBe("premium");
    expect(planFromStatus("canceled")).toBe("basic");
    expect(planFromStatus("unpaid")).toBe("basic");
    expect(planFromStatus("incomplete_expired")).toBe("basic");
  });

  it("reads current_period_end from the subscription or its items", () => {
    const top = { current_period_end: 1_790_000_000, items: { data: [] } };
    const onItems = { items: { data: [{ current_period_end: 1_790_000_000 }] } };
    const expected = new Date(1_790_000_000 * 1000).toISOString();
    expect(subscriptionPeriodEnd(top as unknown as Stripe.Subscription)).toBe(expected);
    expect(subscriptionPeriodEnd(onItems as unknown as Stripe.Subscription)).toBe(expected);
    expect(subscriptionPeriodEnd({ items: { data: [] } } as unknown as Stripe.Subscription)).toBeNull();
  });
});
