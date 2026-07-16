import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { Toaster } from "@/components/ui/sonner";

// Protected route group. The middleware already redirects unauthenticated
// users, but we re-check here (defence in depth) and use the user to render
// the navbar.
export default async function AppLayout({
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

  return (
    // Same visual base as the landing: soft purple mesh background + brand
    // typography. The pill navbar is static (in flow), so the main content
    // only needs a small gap below it. `app-shell` switches the shadcn tokens
    // to the brand palette for this route group only (see :root:has(.app-shell)
    // in globals.css).
    <div className="app-shell mesh-bg min-h-dvh font-sans text-on-surface">
      <Navbar email={user.email ?? ""} />
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:pt-10">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
