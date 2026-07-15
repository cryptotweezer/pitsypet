import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardChatWidget } from "@/components/assistant/dashboard-chat-widget";
import { Toaster } from "@/components/ui/sonner";

// Dashboard shell — its own route group (NOT under (app)) so it has no top
// navbar: a full-height left sidebar owns all navigation, and section pages
// render on the right via client-side navigation (the rail never re-mounts).
// The floating assistant widget is available on every section.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { count } = await supabase
    .from("pets")
    .select("pet_id", { count: "exact", head: true })
    .is("deleted_at", null);
  const hasPets = (count ?? 0) > 0;

  return (
    <div className="app-shell mesh-bg min-h-dvh font-sans text-on-surface">
      <DashboardSidebar email={user.email ?? ""} />
      {/* pt clears the mobile top bar; lg:pl clears the fixed rail. */}
      <main className="px-4 pt-20 pb-16 lg:pt-10 lg:pr-8 lg:pl-72">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <DashboardChatWidget hasPets={hasPets} />
      <Toaster />
    </div>
  );
}
