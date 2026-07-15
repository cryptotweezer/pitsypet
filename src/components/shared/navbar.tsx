"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

// Floating pill navbar — same visual language as the landing header (white
// pill, brand wordmark, brand CTA button). Section navigation lives in the
// dashboard sidebar, so the navbar only carries identity + logout.
export function Navbar({ email }: { email: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-5">
      <nav
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-full bg-white px-5 py-2.5 transition-all sm:px-6 ${
          scrolled ? "shadow-xl shadow-black/10" : "shadow-lg shadow-black/5"
        }`}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="PitsyPet"
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="hidden font-display text-xl font-black tracking-tighter text-brand sm:inline">
            PitsyPet
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden text-sm text-on-surface-variant lg:inline">
            {email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95 disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </nav>
    </header>
  );
}
