import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});

function isMissingStripeCustomer(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "resource_missing"
  );
}

// DELETE /api/account
//
// Billing is removed first so a failed database deletion can never leave an
// invisible subscription charging a deleted account. The database RPC derives
// the user id from auth.uid(), deletes auth.users, and lets the existing
// ON DELETE CASCADE constraints remove all owner data.
export async function DELETE(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Type "DELETE" to confirm account deletion.' },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: "Could not prepare account deletion. Please try again." },
      { status: 500 },
    );
  }

  const hadStripeCustomer = Boolean(profile?.stripe_customer_id);

  if (profile?.stripe_customer_id) {
    try {
      // Stripe permanently removes saved card details and immediately cancels
      // active subscriptions when a customer is deleted.
      await getStripe().customers.del(profile.stripe_customer_id);
    } catch (error) {
      if (!isMissingStripeCustomer(error)) {
        console.error("[account-delete] Stripe customer deletion failed", error);
        return NextResponse.json(
          {
            error:
              "We could not cancel your billing safely, so your account was not deleted. Please try again.",
          },
          { status: 502 },
        );
      }
    }
  }

  const { error: deleteError } = await supabase.rpc("delete_own_account", {
    confirmation_text: parsed.data.confirmation,
  });

  if (deleteError) {
    console.error("[account-delete] Supabase account deletion failed", deleteError);
    return NextResponse.json(
      {
        error: hadStripeCustomer
          ? "Billing was cancelled, but the account could not be deleted. Please contact support."
          : "The account could not be deleted. Please try again or contact support.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
