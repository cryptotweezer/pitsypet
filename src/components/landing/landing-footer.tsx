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
                src="/logo.webp"
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
                href="#"
                aria-label="Instagram"
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M23 4.999a8.9 8.9 0 0 1-2.556.701 4.462 4.462 0 0 0 1.958-2.463 8.9 8.9 0 0 1-2.828 1.081 4.454 4.454 0 0 0-7.59 4.06 12.64 12.64 0 0 1-9.177-4.654 4.44 4.44 0 0 0-.603 2.239c0 1.545.786 2.908 1.981 3.708a4.435 4.435 0 0 1-2.017-.557v.056a4.457 4.457 0 0 0 3.573 4.368 4.47 4.47 0 0 1-2.01.076 4.458 4.458 0 0 0 4.162 3.093 8.933 8.933 0 0 1-5.531 1.906c-.36 0-.714-.021-1.062-.062a12.605 12.605 0 0 0 6.826 2c8.19 0 12.669-6.785 12.669-12.669 0-.193-.005-.386-.014-.577A9.05 9.05 0 0 0 23 4.999z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
