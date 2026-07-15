"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#why-us", label: "Why us" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function LandingHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-5">
      <nav
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-full bg-white px-5 py-2.5 transition-all sm:px-6 ${
          scrolled ? "shadow-xl shadow-black/10" : "shadow-lg shadow-black/5"
        }`}
      >
        <Link
          href="/"
          onClick={() => setActive("")}
          className="flex items-center gap-2"
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

        <div className="hidden items-center space-x-8 md:flex">
          {NAV.map((n) => {
            const isActive = active === n.href;
            const href = pathname === "/" ? n.href : `/${n.href}`;
            return (
              <Link
                key={n.href}
                href={href}
                onClick={() => setActive(n.href)}
                className={`relative text-sm font-medium tracking-tight transition-colors hover:text-brand ${
                  isActive ? "text-brand" : "text-on-surface-variant"
                }`}
              >
                {n.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-brand transition-all duration-300 ${
                    isActive ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {!isLogin && (
            <Link
              href="/login"
              className={
                isRegister
                  ? "rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95"
                  : "hidden px-4 py-2 text-sm font-semibold text-on-surface-variant transition-all hover:text-brand sm:block"
              }
            >
              Log in
            </Link>
          )}
          {!isRegister && (
            <Link
              href="/register"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95"
            >
              Get started
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
