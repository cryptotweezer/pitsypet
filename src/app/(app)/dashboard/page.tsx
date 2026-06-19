import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard · PitsyPet" };

// Placeholder dashboard — confirms auth works end to end. Replaced in Phase 3
// with the real pet list.
export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The profiles row is created by the handle_new_user trigger on signup.
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, state")
    .eq("id", user!.id)
    .maybeSingle();

  const displayName = profile?.name ?? user?.email ?? "there";

  return (
    <section className="grid gap-2">
      <h1 className="font-heading text-2xl font-semibold">
        Welcome, {displayName}
      </h1>
      <p className="text-muted-foreground">
        Your pets and assessments will appear here. Pet profiles arrive in the
        next phase.
      </p>
    </section>
  );
}
