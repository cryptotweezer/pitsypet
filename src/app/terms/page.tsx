import type { Metadata } from "next";
import Link from "next/link";
import {
  BrainCircuit,
  CreditCard,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { LandingHeader } from "@/components/landing/landing-header";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Service · PitsyPet",
  description:
    "The terms that apply when you access or use PitsyPet and PitsyPremium.",
};

const tableOfContents = [
  ["agreement", "Agreement and eligibility"],
  ["service", "What PitsyPet provides"],
  ["veterinary", "Veterinary and emergency limits"],
  ["accounts", "Accounts and user responsibilities"],
  ["ai", "AI-generated information"],
  ["plans", "Plans, payments and renewal"],
  ["cancellation", "Cancellation and refunds"],
  ["acceptable-use", "Acceptable use"],
  ["privacy", "Privacy and data"],
  ["ownership", "Ownership and licence"],
  ["availability", "Availability and changes"],
  ["liability", "Consumer rights and liability"],
  ["termination", "Suspension and termination"],
  ["law", "Governing law and contact"],
] as const;

function TermsSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[2rem] border border-outline-variant/20 bg-white p-6 shadow-sm shadow-brand/5 sm:p-8"
    >
      <h2 className="font-display text-2xl tracking-tight text-brand sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-sm leading-7 font-light text-on-surface-variant sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default async function TermsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh overflow-x-clip bg-surface-container-low font-sans text-on-surface">
      <LandingHeader email={user?.email} />

      <main className="px-4 pt-32 pb-20 sm:pt-36">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-brand via-brand-container to-[#8d56b8] px-6 py-12 text-white sm:px-10 sm:py-16">
            <div className="absolute -top-24 -right-20 size-72 rounded-full bg-white/10 blur-2xl" />
            <div className="relative max-w-3xl">
              <span className="text-sm font-bold tracking-[0.2em] text-white/70 uppercase">
                Clear terms, responsible care
              </span>
              <h1 className="mt-4 font-display text-4xl leading-none tracking-tight sm:text-6xl">
                Terms of Service
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed font-light text-white/85 sm:text-lg">
                These terms explain how you may use PitsyPet, what the service
                can and cannot do, and how PitsyPremium billing works.
              </p>
              <p className="mt-5 text-sm font-light text-white/65">
                Effective 21 July 2026 · Last updated 21 July 2026
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: BrainCircuit,
                title: "Educational triage",
                text: "PitsyPet supports decisions but does not diagnose, prescribe or replace a veterinarian.",
              },
              {
                icon: CreditCard,
                title: "Transparent billing",
                text: "PitsyPremium renews monthly and can be cancelled without an early termination fee.",
              },
              {
                icon: ShieldCheck,
                title: "Consumer rights preserved",
                text: "Nothing in these terms removes rights that cannot be excluded under Australian law.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-[1.75rem] border border-outline-variant/20 bg-white p-5"
              >
                <Icon className="size-5 text-brand" aria-hidden />
                <h2 className="mt-3 font-display text-lg tracking-tight text-brand">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed font-light text-on-surface-variant">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-outline-variant/20 bg-white p-5 lg:sticky lg:top-28">
              <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">
                On this page
              </p>
              <nav aria-label="Terms of Service sections" className="mt-4 grid gap-1">
                {tableOfContents.map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-brand/5 hover:text-brand"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </aside>

            <article className="grid gap-6">
              <TermsSection id="agreement" title="1. Agreement and eligibility">
                <p>
                  These Terms of Service form an agreement between you and
                  PitsyPet, an Australian veterinary triage web application
                  operated by Andres Henao in Sydney, New South Wales, Australia.
                  In these terms, &ldquo;PitsyPet&rdquo;, &ldquo;we&rdquo;,
                  &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to that service and
                  its operator.
                </p>
                <p>
                  By creating an account, accessing PitsyPet or purchasing
                  PitsyPremium, you agree to these terms and our{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . If you do not agree, do not use the service.
                </p>
                <p>
                  You must be at least 18 years old and legally able to enter
                  this agreement. PitsyPet is not directed to children. A parent
                  or guardian must manage any use involving a person under 18.
                </p>
              </TermsSection>

              <TermsSection id="service" title="2. What PitsyPet provides">
                <p>
                  PitsyPet provides educational tools for dog and cat owners,
                  including AI-assisted symptom collection, Low/Medium/High risk
                  triage, pet and medication records, appointment and vet-contact
                  management, an AI assistant, clinic-location information and
                  vet-facing PDF summaries.
                </p>
                <p>
                  Features differ by plan and may be subject to reasonable usage,
                  security and rate limits. The current plan inclusions are shown
                  on the pricing and Plan &amp; Billing pages before purchase.
                </p>
              </TermsSection>

              <TermsSection
                id="veterinary"
                title="3. Veterinary care and emergency limitations"
              >
                <div className="flex items-start gap-4 rounded-[1.5rem] bg-error-container/40 p-5">
                  <ShieldAlert
                    className="mt-0.5 size-6 shrink-0 text-error"
                    aria-hidden
                  />
                  <p className="font-medium text-on-surface">
                    PitsyPet is an educational triage tool only. It does not
                    replace professional veterinary diagnosis, advice or
                    treatment, and using it does not create a veterinarian-client
                    relationship.
                  </p>
                </div>
                <p>
                  Do not use PitsyPet as the sole basis for delaying or avoiding
                  veterinary care. If your pet has difficulty breathing,
                  uncontrolled bleeding, collapse, seizures, suspected poisoning,
                  severe trauma, inability to urinate, extreme pain or any other
                  urgent sign, contact an emergency veterinary clinic immediately.
                </p>
                <p>
                  Location, clinic and opening-hours information may be incomplete
                  or outdated. Confirm availability and instructions directly with
                  the clinic before travelling whenever circumstances allow.
                </p>
              </TermsSection>

              <TermsSection
                id="accounts"
                title="4. Accounts and your responsibilities"
              >
                <div className="flex items-start gap-4 rounded-[1.5rem] bg-brand/5 p-5">
                  <UserRound
                    className="mt-0.5 size-6 shrink-0 text-brand"
                    aria-hidden
                  />
                  <p>
                    You are responsible for keeping your sign-in details secure
                    and for activity performed through your account.
                  </p>
                </div>
                <ul className="list-disc space-y-2 pl-5 marker:text-brand">
                  <li>provide accurate and current account and pet information;</li>
                  <li>review AI output and use reasonable judgment before acting;</li>
                  <li>
                    seek a veterinarian when symptoms are serious, worsening,
                    unclear or inconsistent with the PitsyPet result;
                  </li>
                  <li>
                    notify us through the contact form if you suspect unauthorised
                    account access or a security issue; and
                  </li>
                  <li>
                    avoid entering unnecessary personal information about other
                    people or payment-card details into notes or AI chats.
                  </li>
                </ul>
              </TermsSection>

              <TermsSection id="ai" title="5. AI-generated information">
                <p>
                  PitsyPet uses third-party artificial intelligence models to
                  extract symptoms and generate triage or assistant responses.
                  AI output is probabilistic and may be inaccurate, incomplete,
                  inconsistent or unsuitable for your pet&apos;s circumstances.
                </p>
                <p>
                  Results depend on the information you provide and cannot include
                  a physical examination, diagnostic imaging, laboratory testing
                  or a veterinarian&apos;s full clinical assessment. You remain
                  responsible for decisions about seeking veterinary care.
                </p>
                <p>
                  AI assistant proposals that change PitsyPet records require your
                  confirmation before the application submits the corresponding
                  action. Review every proposed action before approving it.
                </p>
              </TermsSection>

              <TermsSection id="plans" title="6. Plans, payments and automatic renewal">
                <p>
                  PitsyBasic is free and subject to the usage limits displayed in
                  the product. PitsyPremium currently costs <strong>AUD $9.99 per
                  month</strong>. The price and billing interval shown at Stripe
                  Checkout before you confirm payment control if they differ from
                  information shown elsewhere.
                </p>
                <p>
                  PitsyPremium is an automatically renewing monthly subscription.
                  By subscribing, you authorise Stripe to charge the payment method
                  you provide at the start of each billing period until you cancel.
                  Stripe processes payment details and provides receipts and
                  invoices; PitsyPet does not receive your complete card number or
                  card security code.
                </p>
                <p>
                  Any taxes that PitsyPet is legally required to collect will be
                  shown at checkout. If we change the subscription price, we will
                  provide reasonable notice before the new price applies to a
                  future renewal, and you may cancel before that renewal.
                </p>
              </TermsSection>

              <TermsSection id="cancellation" title="7. Cancellation, deletion and refunds">
                <p>
                  You may cancel PitsyPremium at any time from Dashboard &rarr;
                  Plan &amp; Billing &rarr; Manage subscription &amp; invoices.
                  Cancellation normally takes effect at the end of the current
                  paid billing period, you retain Premium access until then, and
                  there is no early termination fee.
                </p>
                <p>
                  Permanently deleting your PitsyPet account immediately deletes
                  the Stripe customer where one exists, cancels active billing and
                  ends access to the service. Because deletion cannot be undone,
                  export anything you need before confirming it.
                </p>
                <p>
                  We do not ordinarily provide refunds for a change of mind or an
                  unused part of a correctly supplied billing period. This does not
                  limit any refund, cancellation, re-supply or other remedy you are
                  entitled to under the Australian Consumer Law or another law
                  that cannot be excluded.
                </p>
              </TermsSection>

              <TermsSection id="acceptable-use" title="8. Acceptable use">
                <p>You must not use PitsyPet to:</p>
                <ul className="list-disc space-y-2 pl-5 marker:text-brand">
                  <li>break a law, infringe rights or harm another person or animal;</li>
                  <li>
                    obtain or provide veterinary prescriptions, diagnoses or
                    treatment while misrepresenting PitsyPet as a veterinarian;
                  </li>
                  <li>
                    access another account, bypass security or usage controls, or
                    probe the service for vulnerabilities without permission;
                  </li>
                  <li>
                    automate excessive requests, scrape, copy or resell the service
                    or its outputs, or interfere with other users;
                  </li>
                  <li>upload malicious code or content you have no right to use; or</li>
                  <li>
                    use PitsyPet for human medical triage or for animals outside
                    the supported dog and cat service.
                  </li>
                </ul>
              </TermsSection>

              <TermsSection id="privacy" title="9. Privacy and your data">
                <p>
                  Our{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  explains what information is processed, the providers involved,
                  international processing, retention and your privacy rights.
                </p>
                <p>
                  You retain responsibility for and rights in the pet information
                  and other content you submit. You give PitsyPet a limited licence
                  to host, process, transmit and display that content only as needed
                  to provide, secure and support the service and comply with law.
                </p>
              </TermsSection>

              <TermsSection id="ownership" title="10. PitsyPet ownership and licence">
                <p>
                  PitsyPet&apos;s software, design, branding, original text and
                  service materials are owned by or licensed to PitsyPet and are
                  protected by applicable intellectual-property laws. Third-party
                  names and materials remain the property of their respective
                  owners.
                </p>
                <p>
                  While these terms apply, we grant you a limited, personal,
                  non-exclusive, non-transferable and revocable licence to use the
                  service for your own lawful, non-commercial pet-care purposes.
                  This licence does not permit copying, selling, reverse
                  engineering or creating a competing service from PitsyPet except
                  where applicable law does not allow that restriction.
                </p>
              </TermsSection>

              <TermsSection id="availability" title="11. Availability, third parties and changes">
                <p>
                  PitsyPet relies on third parties including Supabase, Anthropic,
                  Stripe, Vercel, mapping and security providers. Outages,
                  maintenance, network failures or provider changes may temporarily
                  limit the service. We do not promise uninterrupted or error-free
                  availability.
                </p>
                <p>
                  We may improve, replace or discontinue features where reasonably
                  necessary for safety, security, legal compliance or product
                  development. We will give reasonable notice of material changes
                  that significantly reduce a paid service where practicable.
                </p>
                <p>
                  External websites, maps and clinic listings are provided for
                  convenience. Their content, availability and practices are
                  controlled by their operators and may have separate terms.
                </p>
              </TermsSection>

              <TermsSection id="liability" title="12. Australian Consumer Law and liability">
                <div className="flex items-start gap-4 rounded-[1.5rem] bg-brand/5 p-5">
                  <Scale
                    className="mt-0.5 size-6 shrink-0 text-brand"
                    aria-hidden
                  />
                  <p>
                    Nothing in these terms excludes, restricts or modifies any
                    consumer guarantee, right or remedy that cannot lawfully be
                    excluded, including under the Australian Consumer Law.
                  </p>
                </div>
                <p>
                  Subject to those non-excludable rights, PitsyPet does not promise
                  that an AI result will be medically complete or correct, that a
                  clinic listing will be current, or that using the service will
                  produce a particular health outcome. You should obtain timely
                  professional veterinary care and follow emergency warnings.
                </p>
                <p>
                  To the extent permitted by law, PitsyPet is not responsible for
                  indirect loss that was not reasonably foreseeable, or for loss
                  caused by inaccurate information you provided, misuse of the
                  service, ignoring an emergency warning, unauthorised account use
                  caused by your failure to protect credentials, or a third-party
                  service outside our reasonable control.
                </p>
                <p>
                  For information about Australian consumer guarantees and
                  remedies, visit the{" "}
                  <a
                    href="https://www.accc.gov.au/consumers/buying-products-and-services/consumer-rights-and-guarantees"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    Australian Competition and Consumer Commission
                  </a>
                  .
                </p>
              </TermsSection>

              <TermsSection id="termination" title="13. Suspension and termination">
                <p>
                  You may stop using PitsyPet, cancel Premium or permanently delete
                  your account at any time. We may temporarily restrict or suspend
                  access where reasonably necessary to investigate fraud, protect
                  users or animals, secure the service, comply with law, prevent
                  material misuse or address a serious breach of these terms.
                </p>
                <p>
                  Where appropriate, we will give notice and a reasonable
                  opportunity to fix the issue before termination. Immediate action
                  may be necessary for an urgent security, legal, safety or abuse
                  risk. Any cancellation or refund rights required by law remain
                  unaffected.
                </p>
                <p>
                  Provisions that by their nature should continue after termination
                  will continue, including accrued payment obligations, ownership,
                  consumer-law protections and dispute provisions.
                </p>
              </TermsSection>

              <TermsSection id="law" title="14. Governing law, changes and contact">
                <p>
                  These terms are governed by the laws of New South Wales and the
                  Commonwealth of Australia. The parties submit to courts with
                  jurisdiction in New South Wales, but this does not prevent you
                  from relying on another law, regulator, tribunal or court where
                  that right cannot be excluded.
                </p>
                <p>
                  If a provision is invalid or unenforceable, it will be limited or
                  removed only to the extent necessary and the remaining provisions
                  will continue. A delay in enforcing a right is not a waiver of it.
                </p>
                <p>
                  We may update these terms to reflect product, provider or legal
                  changes. The current version will remain at this URL with its
                  effective date. We will provide reasonable notice before a
                  material change adversely affects an existing paid subscription.
                </p>
                <p>
                  For questions, billing concerns or disputes, use the{" "}
                  <Link
                    href="/#contact"
                    className="font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    PitsyPet contact form
                  </Link>
                  . We will try to resolve concerns directly, without limiting your
                  right to contact a regulator or pursue another lawful remedy.
                </p>
              </TermsSection>
            </article>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant/20 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <Link
            href="/"
            className="font-display text-xl font-black tracking-tighter text-brand"
          >
            PitsyPet
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-light text-on-surface-variant sm:justify-end">
            <Link href="/privacy" className="transition-colors hover:text-brand">
              Privacy Policy
            </Link>
            <Link href="/#contact" className="transition-colors hover:text-brand">
              Contact
            </Link>
            <span>© 2026 PitsyPet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
