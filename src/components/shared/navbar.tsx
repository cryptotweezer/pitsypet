"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Navbar({ email }: { email: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="font-heading text-base font-semibold">
          PitsyPet
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/history"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            History
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Log out"}
          </Button>
        </div>
      </nav>
    </header>
  );
}
