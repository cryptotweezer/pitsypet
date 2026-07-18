import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// DOCUMENTED EXCEPTION to the "service-role key lives only in scripts/" rule.
//
// Billing state (profiles.plan + stripe_* columns) must be written WITHOUT a
// user session (Stripe webhooks) and is deliberately not writable by the
// `authenticated` role (column-level REVOKE — otherwise users could self-
// upgrade via PostgREST). So the ONLY writer is this service-role client, and
// the ONLY permitted importer is `src/lib/billing/subscription.ts`, whose
// callers act strictly on Stripe-verified evidence: a signature-checked
// webhook event, or a Checkout session retrieved server-side from Stripe and
// ownership-checked against the signed-in user.
//
// Do NOT import this anywhere else in src/. The Phase-9 audit grep is now:
//   grep -r SERVICE_ROLE_KEY src/  → must match ONLY this file.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client env vars are not set");
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
