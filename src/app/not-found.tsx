import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dynamic so the 404 receives the middleware's per-request CSP nonce — under
// our 'strict-dynamic' script-src a build-time static page's scripts would be
// blocked. See src/lib/security/csp.ts.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
      >
        Go home
      </Link>
    </div>
  );
}
