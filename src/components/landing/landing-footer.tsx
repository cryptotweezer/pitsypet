import Image from "next/image";
import Link from "next/link";

// Shared marketing footer. The landing page renders it with `decorated` so the
// cartoon sticker overlaps the section above; the legal pages render it plain
// and pass anchorPrefix="/" so the in-page links jump back to the landing.
export function LandingFooter({
  decorated = false,
  anchorPrefix = "",
}: {
  decorated?: boolean;
  anchorPrefix?: string;
}) {
  return (
    <footer
      className={
        decorated
          ? "relative z-10 -mt-12 rounded-t-[3rem] bg-surface-container-low pt-24 pb-8 md:-mt-16 md:rounded-t-[4rem]"
          : "relative z-10 border-t border-outline-variant/10 bg-surface-container-low pt-16 pb-8"
      }
    >
      {decorated ? (
        <Image
          src="/cartoon8.webp"
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          className="pointer-events-none absolute bottom-full left-1/2 h-auto w-[85%] max-w-3xl -translate-x-1/2 translate-y-1/3 object-contain"
        />
      ) : null}
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="mb-4 flex items-center gap-2.5 font-display text-3xl font-black tracking-tighter text-brand">
              <Image
                src="/pitsy_logo.webp"
                alt=""
                aria-hidden
                width={48}
                height={48}
                className="h-10 w-10 object-contain"
              />
              PitsyPet
            </div>
            <p className="max-w-sm text-lg leading-relaxed font-light text-on-surface-variant">
              Helping Australian pet owners judge how urgent a symptom is, with
              safety-first AI triage.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="https://www.linkedin.com/in/andreshenao/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
              <a
                href="https://github.com/cryptotweezer"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
                </svg>
              </a>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-3">
            <h4 className="mb-8 text-xs font-bold tracking-widest text-brand uppercase">
              Legal
            </h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-brand">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-brand">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href={`${anchorPrefix}#contact`}
                  className="transition-colors hover:text-brand"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-1 lg:col-span-3">
            <h4 className="mb-8 text-xs font-bold tracking-widest text-brand uppercase">
              Product
            </h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li>
                <a
                  href={`${anchorPrefix}#how-it-works`}
                  className="transition-colors hover:text-brand"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href={`${anchorPrefix}#why-us`}
                  className="transition-colors hover:text-brand"
                >
                  Why us
                </a>
              </li>
              <li>
                <a
                  href={`${anchorPrefix}#pricing`}
                  className="transition-colors hover:text-brand"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-6 border-t border-outline-variant/10 pt-8 md:flex-row">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <p className="flex items-center justify-center gap-2 text-sm leading-relaxed font-bold text-on-surface-variant md:justify-start">
              <Image
                src="/logo_black.png"
                alt=""
                aria-hidden
                width={32}
                height={32}
                className="h-6 w-6 object-contain"
              />
              <span>
                Developed by{" "}
                <a
                  href="https://cv.andreshenao.com.au/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand hover:underline"
                >
                  Andres Henao
                </a>
              </span>
            </p>
            <p className="text-[8px] leading-relaxed font-light text-on-surface-variant/70">
              <strong>Disclaimer:</strong> PitsyPet is an educational triage tool
              only and does not replace professional veterinary diagnosis,
              advice, or treatment.
            </p>
          </div>
          <p className="text-[10px] font-light text-on-surface-variant/70">
            © 2026 PitsyPet.
          </p>
        </div>
      </div>
    </footer>
  );
}
