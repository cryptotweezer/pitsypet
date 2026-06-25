import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Render per-request so this page receives the middleware's per-request CSP
// nonce (our script-src uses 'strict-dynamic', which ignores 'self' — a
// build-time static page's un-nonced scripts would be blocked). Any new public
// page added under this CSP must be dynamic too. See src/lib/security/csp.ts.
export const dynamic = "force-dynamic";

// PLACEHOLDER landing page (added pre-Phase 3 as a clean entry point for manual
// testing). Phase 8, task 8.1 polishes this into the real landing — hero + CTA,
// 3 features, 3-step how-it-works, footer disclaimer. Intentionally minimal for now.
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            PitsyPet
          </h1>
          <p className="mx-auto max-w-md text-balance text-lg text-muted-foreground">
            AI-powered symptom triage for Australian dog &amp; cat owners.
          </p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            An educational tool that helps you gauge how urgent your pet&apos;s
            symptoms are — <span className="font-medium">not a diagnosis</span>.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
          >
            Get started
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 px-6 text-base"
            )}
          >
            Log in
          </Link>
        </div>
      </main>

      <footer className="border-t px-6 py-6">
        <p className="mx-auto max-w-2xl text-center text-xs text-muted-foreground">
          PitsyPet is an educational triage tool and does not replace professional
          veterinary diagnosis, advice, or treatment. In a suspected emergency,
          contact a veterinary clinic or emergency animal hospital immediately.
        </p>
      </footer>
    </div>
  );
}
