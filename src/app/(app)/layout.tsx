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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Navbar email={user.email ?? ""} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <Toaster />
    </div>
  );
}
