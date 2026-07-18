"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  CircleHelp,
  CreditCard,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PawPrint,
  Stethoscope,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/pets", label: "Pets", icon: PawPrint },
  { href: "/dashboard/clinics", label: "Vet clinics", icon: Stethoscope },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    icon: CalendarClock,
  },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/billing", label: "Plan", icon: CreditCard },
];

// Full-height dashboard sidebar (the dashboard has no top navbar): logo, main
// nav, and a bottom block with Help + the signed-in user + Log off.
// Desktop: fixed left rail. Mobile: a slim top bar with a hamburger that opens
// the same rail as a drawer.
export function DashboardSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function itemClasses(active: boolean) {
    return `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
      active
        ? "bg-brand text-white shadow-md shadow-brand/20"
        : "text-on-surface-variant hover:bg-muted hover:text-brand"
    }`;
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const rail = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-2"
        onClick={() => setOpen(false)}
      >
        <Image
          src="/logo.png"
          alt="PitsyPet"
          width={40}
          height={40}
          className="h-9 w-9 object-contain"
          priority
        />
        <span className="font-display text-xl font-black tracking-tighter text-brand">
          PitsyPet
        </span>
      </Link>

      <nav aria-label="Dashboard sections" className="grid gap-1.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href, exact) ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={itemClasses(isActive(href, exact))}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto grid gap-1.5 border-t border-outline-variant/20 pt-4">
        <Link
          href="/dashboard/help"
          aria-current={isActive("/dashboard/help") ? "page" : undefined}
          onClick={() => setOpen(false)}
          className={itemClasses(isActive("/dashboard/help"))}
        >
          <CircleHelp className="size-4" aria-hidden />
          Help
        </Link>
        <p
          className="truncate px-4 py-1 text-xs font-light text-on-surface-variant"
          title={email}
        >
          {email}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
        >
          <LogOut className="size-4" aria-hidden />
          {signingOut ? "Signing out…" : "Log off"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-outline-variant/20 bg-white px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="PitsyPet"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-display text-lg font-black tracking-tighter text-brand">
            PitsyPet
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-full text-brand transition-colors hover:bg-muted"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </header>

      {/* Mobile drawer + overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-muted"
            >
              <X className="size-5" aria-hidden />
            </button>
            {rail}
          </aside>
        </div>
      )}

      {/* Desktop fixed rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-outline-variant/20 bg-white lg:block">
        {rail}
      </aside>
    </>
  );
}
