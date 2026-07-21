import type { Metadata } from "next";
import Link from "next/link";
import {
  BrainCircuit,
  Database,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { LandingHeader } from "@/components/landing/landing-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Privacy Policy · PitsyPet",
  description:
    "How PitsyPet collects, uses, protects and deletes personal information.",
};

const tableOfContents = [
  ["overview", "Overview"],
  ["information", "Information we collect"],
  ["use", "How we use information"],
  ["ai", "AI processing"],
  ["providers", "Service providers"],
  ["retention", "Retention and deletion"],
  ["rights", "Your rights"],
  ["security", "Security and transfers"],
  ["contact", "Contact and complaints"],
] as const;

function PolicySection({
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

export default async function PrivacyPage() {
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
                Privacy, clearly
              </span>
              <h1 className="mt-4 font-display text-4xl leading-none tracking-tight sm:text-6xl">
                Your information stays yours.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed font-light text-white/85 sm:text-lg">
                This policy explains what PitsyPet needs to operate, which
                technical providers process data for us, and how you can access,
                correct or permanently delete your information.
              </p>
              <p className="mt-5 text-sm font-light text-white/65">
                Effective 21 July 2026 · Last updated 21 July 2026
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "No sale or advertising",
                text: "We do not sell, rent or use your information for advertising or research.",
              },
              {
                icon: LockKeyhole,
                title: "Limited processing",
                text: "Data is used only to provide, secure and support PitsyPet.",
              },
              {
                icon: Trash2,
                title: "Permanent account deletion",
                text: "You can delete your account and its active database records from Account settings.",
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
              <nav aria-label="Privacy Policy sections" className="mt-4 grid gap-1">
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
              <PolicySection
                id="overview"
                title="1. Who we are and when this policy applies"
              >
                <p>
                  PitsyPet is an Australian veterinary triage web application
                  operated by Andres Henao in Sydney, Australia. In this policy,
                  “PitsyPet”, “we”, “us” and “our” refer to that service and its
                  operator.
                </p>
                <p>
                  This policy applies when you visit PitsyPet, create an account,
                  enter pet records, use AI triage or assistant features, subscribe
                  to PitsyPremium, export a veterinary PDF, or contact us.
                </p>
                <p>
                  It is intended to reflect the Australian Privacy Act 1988 and
                  Australian Privacy Principles where they apply, and the EU/EEA
                  General Data Protection Regulation (GDPR) where PitsyPet is
                  subject to it. PitsyPet is not a veterinary clinic and does not
                  provide human healthcare services.
                </p>
              </PolicySection>

              <PolicySection id="information" title="2. Information we collect">
                <p>We collect information directly from you when you use the service:</p>
                <ul className="list-disc space-y-2 pl-5 marker:text-brand">
                  <li>
                    <strong>Account information:</strong> name, email address,
                    password credential managed by Supabase Auth, optional
                    Australian state, account plan and authentication records.
                  </li>
                  <li>
                    <strong>Pet and clinical records:</strong> pet name, species,
                    breed, age, weight, medical conditions, symptoms, medications,
                    vet clinics and doctors, appointments, notes and follow-ups.
                  </li>
                  <li>
                    <strong>Triage and assistant content:</strong> messages,
                    extracted symptoms, risk classification, reasoning,
                    recommendations and related technical model information.
                  </li>
                  <li>
                    <strong>Billing information:</strong> subscription status,
                    Stripe customer and subscription identifiers, renewal or
                    cancellation date. PitsyPet never receives or stores your full
                    card number or card security code.
                  </li>
                  <li>
                    <strong>Contact information:</strong> the name, email address
                    and message you submit through our contact form. Contact
                    messages are emailed to the operator and are not written to
                    the PitsyPet application database.
                  </li>
                  <li>
                    <strong>Limited technical information:</strong> session
                    cookies, IP address and request metadata used for security and
                    rate limiting, error diagnostics, coarse device/browser data,
                    and anonymous counts of page or feature use.
                  </li>
                </ul>
                <p>
                  Please do not enter unnecessary information about people,
                  particularly human medical information, government identifiers
                  or payment card details, into pet notes or AI chats.
                </p>
              </PolicySection>

              <PolicySection id="use" title="3. How and why we use information">
                <p>We use information only for the following purposes:</p>
                <ul className="list-disc space-y-2 pl-5 marker:text-brand">
                  <li>create and secure your account;</li>
                  <li>store and display the pet records you choose to keep;</li>
                  <li>provide AI-assisted symptom extraction, triage and chat;</li>
                  <li>generate results and vet-facing PDF exports;</li>
                  <li>process subscriptions and provide invoices through Stripe;</li>
                  <li>prevent abuse, enforce plan limits and keep the service reliable;</li>
                  <li>diagnose errors, respond to support requests and comply with law.</li>
                </ul>
                <p>
                  We do <strong>not</strong> sell or rent personal information. We
                  do not use pet records, chats or assessment results for
                  advertising, marketing profiles, scientific studies, model
                  training, or creation of commercial datasets. Limited anonymous
                  event counts are used only to operate and maintain the product.
                </p>
                <p>
                  For GDPR purposes, the main lawful bases are performance of our
                  contract with you (providing PitsyPet), legitimate interests in
                  security and service reliability, compliance with legal
                  obligations, and consent where we specifically ask for it. You
                  may withdraw consent at any time without affecting earlier lawful
                  processing.
                </p>
              </PolicySection>

              <PolicySection id="ai" title="4. AI triage and automated processing">
                <div className="flex items-start gap-4 rounded-[1.5rem] bg-brand/5 p-5">
                  <BrainCircuit
                    className="mt-0.5 size-6 shrink-0 text-brand"
                    aria-hidden
                  />
                  <p>
                    Relevant pet details, recent clinical history and the text you
                    submit are sent to Anthropic&apos;s commercial API so Claude can
                    extract symptoms and produce a triage response.
                  </p>
                </div>
                <p>
                  Anthropic states that commercial API inputs and outputs are not
                  used to train its models by default and are normally deleted
                  from its backend within 30 days. Anthropic may retain limited
                  material longer where required by law or to investigate abuse or
                  usage-policy violations.
                </p>
                <p>
                  The Low, Medium or High risk result is an automated assessment
                  about a pet. It is educational guidance, not a veterinary
                  diagnosis, and does not make a legal or similarly significant
                  decision about a person. You should contact a veterinarian or an
                  emergency clinic whenever you are concerned about your pet.
                </p>
              </PolicySection>

              <PolicySection
                id="providers"
                title="5. Service providers and disclosure"
              >
                <p>
                  We do not disclose information for anyone else&apos;s independent
                  advertising or research. We use the following providers only as
                  needed to operate PitsyPet:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-sm">
                    <thead>
                      <tr className="text-brand">
                        <th className="border-b border-outline-variant/20 px-3 py-3 font-bold">Provider</th>
                        <th className="border-b border-outline-variant/20 px-3 py-3 font-bold">Purpose</th>
                        <th className="border-b border-outline-variant/20 px-3 py-3 font-bold">Relevant data</th>
                      </tr>
                    </thead>
                    <tbody className="[&_td]:border-b [&_td]:border-outline-variant/10 [&_td]:px-3 [&_td]:py-3 [&_td]:align-top">
                      <tr><td>Supabase</td><td>Authentication and PostgreSQL database</td><td>Account and application records</td></tr>
                      <tr><td>Anthropic</td><td>AI triage and assistant responses</td><td>Prompt, pet context and output</td></tr>
                      <tr><td>Vercel</td><td>Application hosting and delivery</td><td>Request and infrastructure metadata</td></tr>
                      <tr><td>Stripe</td><td>Subscriptions, payments and invoices</td><td>Email, billing and transaction data</td></tr>
                      <tr><td>Upstash and Arcjet</td><td>Rate limiting, abuse and bot protection</td><td>User ID or IP and request metadata</td></tr>
                      <tr><td>Sentry</td><td>Error and performance diagnostics</td><td>Technical diagnostics; default PII collection is disabled</td></tr>
                      <tr><td>PostHog</td><td>Minimal operational event counts</td><td>Cookieless, anonymous route and feature events</td></tr>
                      <tr><td>Google Gmail</td><td>Delivering contact enquiries</td><td>Name, email and message</td></tr>
                      <tr><td>OpenStreetMap</td><td>Displaying the emergency-clinic map</td><td>IP address and map-tile request metadata</td></tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  We may also disclose information if required by Australian law,
                  a valid court order, or where reasonably necessary to address a
                  serious threat, fraud, abuse or security incident. We will limit
                  any disclosure to what is legally necessary.
                </p>
              </PolicySection>

              <PolicySection id="retention" title="6. Retention and deletion">
                <div className="flex items-start gap-4 rounded-[1.5rem] bg-brand/5 p-5">
                  <Database
                    className="mt-0.5 size-6 shrink-0 text-brand"
                    aria-hidden
                  />
                  <p>
                    PitsyPet keeps account and pet records only while needed to
                    provide the service or until you delete them. We do not keep a
                    separate research archive or dataset made from deleted clinical
                    records.
                  </p>
                </div>
                <p>
                  You can delete pet records through the product. Where a recovery
                  option is shown, the item remains until you choose permanent
                  deletion. From <strong>Dashboard → Account</strong>, you can
                  permanently delete your entire account. This removes the user and
                  associated PitsyPet records from the active database through
                  database cascades. If you have a Stripe customer, deletion also
                  removes stored card details and immediately cancels active
                  subscriptions.
                </p>
                <p>
                  Deletion from an active system cannot always remove every
                  temporary copy instantly. Encrypted backups, security logs and
                  provider disaster-recovery copies may remain until their normal
                  expiry and are not used for new purposes. Stripe and other
                  providers may retain transaction or compliance records where law
                  requires it. Anthropic&apos;s standard commercial API retention is
                  described in section 4.
                </p>
                <p>
                  Rate-limit and daily-usage counters are short-lived and normally
                  expire within two days. Contact enquiries are retained in the
                  support mailbox only as long as reasonably needed to respond,
                  resolve the issue or meet a legal obligation.
                </p>
              </PolicySection>

              <PolicySection
                id="rights"
                title="7. Access, correction and your rights"
              >
                <p>
                  You can view and correct most profile and pet information inside
                  PitsyPet. You may also contact us to request access, correction,
                  a portable copy, restriction, objection or deletion of personal
                  information associated with you. We may need to verify your
                  identity before completing a request.
                </p>
                <p>
                  If the GDPR applies to you, your rights may include being
                  informed, access, rectification, erasure, restriction, data
                  portability, objection, withdrawal of consent and rights relating
                  to certain automated decisions. We will generally respond within
                  one month, subject to lawful extensions or exceptions.
                </p>
                <p>
                  Privacy rights are not absolute. For example, a provider may need
                  to retain limited billing information to comply with tax,
                  accounting, fraud-prevention or other legal obligations. We will
                  explain any applicable exception.
                </p>
                <p>
                  PitsyPet is intended for adults and is not directed to children
                  under 18. If you believe a child has provided personal information,
                  contact us so it can be investigated and deleted where required.
                </p>
              </PolicySection>

              <PolicySection
                id="security"
                title="8. Security and overseas processing"
              >
                <div className="flex items-start gap-4 rounded-[1.5rem] bg-brand/5 p-5">
                  <Globe2
                    className="mt-0.5 size-6 shrink-0 text-brand"
                    aria-hidden
                  />
                  <p>
                    PitsyPet is operated in Australia, while some service providers
                    process data overseas. Likely processing locations include
                    Australia and the United States, and may include the European
                    Union or other locations used by a provider and its disclosed
                    subprocessors.
                  </p>
                </div>
                <p>
                  Where required, we rely on contractual and legal safeguards for
                  overseas processing, such as data-processing agreements and the
                  EU Standard Contractual Clauses. You can contact us for current
                  information about provider locations.
                </p>
                <p>
                  Security measures include encrypted HTTPS connections, Supabase
                  Row Level Security, authenticated access controls, restricted
                  administrative credentials, request validation, bot and rate-limit
                  protection, and security monitoring. No online system can promise
                  absolute security.
                </p>
                <p>
                  If a data breach is likely to cause serious harm and notification
                  is required, we will notify affected users and the Office of the
                  Australian Information Commissioner (OAIC), or another relevant
                  authority, as required by law.
                </p>
              </PolicySection>

              <PolicySection
                id="contact"
                title="9. Contact, complaints and policy changes"
              >
                <p>
                  For a privacy request or complaint, use the{" "}
                  <Link
                    href="/#contact"
                    className="font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    PitsyPet contact form
                  </Link>
                  . Include “Privacy request” in your message and enough information
                  for us to identify your account. We will acknowledge the request
                  and aim to provide a substantive response within 30 days.
                </p>
                <p>
                  If you are not satisfied, you may complain to the{" "}
                  <a
                    href="https://www.oaic.gov.au/privacy/privacy-complaints"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    Office of the Australian Information Commissioner
                  </a>
                  . If the GDPR applies, you may also lodge a complaint with the
                  data-protection authority where you live or work.
                </p>
                <p>
                  We may update this policy when the product, providers or law
                  changes. The current version will remain available at this URL
                  with its effective date. Material changes will be highlighted in
                  the product or otherwise communicated where appropriate.
                </p>
              </PolicySection>
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
          <p className="text-sm font-light text-on-surface-variant">
            © 2026 PitsyPet · Built with privacy in mind.
          </p>
        </div>
      </footer>
    </div>
  );
}
