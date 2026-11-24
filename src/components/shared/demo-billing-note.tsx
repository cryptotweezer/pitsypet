import { cn } from "@/lib/utils";

const REPO = "https://github.com/cryptotweezer/pitsypet";

// Payments run in Stripe TEST mode: PitsyPet is a portfolio/demo project, not
// a product for sale. Shown under the landing pricing cards and on billing.
export function DemoBillingNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-center text-sm text-on-surface-variant",
        className,
      )}
    >
      <strong className="font-semibold text-on-surface">Demo only:</strong>{" "}
        PitsyPet is not for sale. Payments run in Stripe test mode. Get the
        open-source version on{" "}
      <a
        href={REPO}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 align-bottom font-semibold text-brand underline-offset-4 hover:underline"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
          <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
        </svg>
        GitHub
      </a>
    </p>
  );
}
