-- Billing (Stripe subscriptions) — plan state on profiles.
--
-- `plan` is the single source of truth the app reads to know whether a user is
-- PitsyBasic (free) or PitsyPremium. It is maintained EXCLUSIVELY by the
-- server after Stripe-verified evidence (webhook signature / retrieved
-- Checkout session) — never by the client. Plan LIMITS (Basic caps) are NOT
-- enforced yet; this migration only stores subscription state.

ALTER TABLE profiles
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'basic'
    CHECK (plan IN ('basic', 'premium')),
  ADD COLUMN stripe_customer_id TEXT UNIQUE,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN plan_renews_at TIMESTAMPTZ,
  ADD COLUMN plan_cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

-- The "Users update own profile" RLS policy row-scopes updates, but RLS says
-- nothing about WHICH columns a user may change — without this, any
-- authenticated user could PATCH their own row via PostgREST and set
-- plan='premium' for free. Column-level privileges close that: users may only
-- edit their human fields; billing columns are writable solely by the
-- service_role (Stripe webhook / checkout confirmation).
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (name, state) ON profiles TO authenticated;
