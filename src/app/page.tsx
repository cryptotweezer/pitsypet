import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  Brain,
  Check,
  CircleCheck,
  FileText,
  HeartPulse,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  ShieldCheck,
  Siren,
  Stethoscope,
  Users,
} from "lucide-react";

import { EMERGENCY_CLINICS } from "@/components/landing/emergency-clinics";
import { EmergencyMap } from "@/components/landing/emergency-map";
import { ContactForm } from "@/components/landing/contact-form";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { LandingHeader } from "@/components/landing/landing-header";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

// Render per-request so this page receives the middleware's per-request CSP
// nonce (our script-src uses 'strict-dynamic', which ignores 'self' — a
// build-time static page's un-nonced scripts would be blocked). Any new public
// page added under this CSP must be dynamic too. See src/lib/security/csp.ts.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="landing-root mesh-bg font-sans text-on-surface">
      <LandingHeader />
      <ScrollReveal />

      <main className="overflow-x-clip">
        {/* Hero — full screen; gradient lightens toward the dog on the right */}
        <section className="relative min-h-dvh snap-start overflow-hidden bg-gradient-to-r from-brand via-brand-container to-[#c3a3e8]">
          {/* Cut-out pet photos (transparent PNG/WebP), absolute on the right */}
          <HeroCarousel />
          <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl items-center px-4 pt-20">
            <div className="max-w-xl space-y-8 text-white">
              <h1 className="text-display-lg-mobile leading-[1.05] text-balance md:text-display-lg">
                Know what to do when your pet gets sick.
              </h1>
              <p className="text-lg leading-relaxed font-light text-white/80 md:text-xl">
                PitsyPet&apos;s AI reads your pet&apos;s symptoms and tells you if
                it&apos;s safe to watch at home, worth a vet visit, or an
                emergency.
                <span className="mt-2 block font-semibold text-white">
                  in minutes, 24/7, at no upfront cost.
                </span>
              </p>
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-2xl bg-white px-10 py-5 text-center text-lg font-bold text-brand shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Get started free
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-2xl border-2 border-white/70 px-10 py-5 text-center text-lg font-bold text-white transition-all hover:bg-white/10"
                >
                  See how it works
                </a>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-white" />
                <span className="text-sm font-medium text-white/80">
                  Grounded in Australian veterinary guidelines (RSPCA &amp; AVA)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem — emotional pause (white rounded panel over the hero) */}
        <section
          id="problem"
          className="relative z-10 snap-start bg-gradient-to-r from-brand via-brand-container to-[#c3a3e8]"
        >
          <div className="flex min-h-dvh items-center overflow-hidden bg-gradient-to-br from-white via-[#f6ecfb] to-[#e6c5fe] py-24 text-on-surface">
          <div className="relative z-10 mx-auto my-auto flex max-w-5xl flex-col items-center gap-12 px-4 lg:flex-row lg:gap-16">
            {/* Text — right */}
            <div className="reveal order-2 space-y-5 text-center lg:w-1/2 lg:text-left">
              <span className="block text-label-caps font-bold text-brand opacity-70">
                WHEN SOMETHING FEELS OFF
              </span>
              <h2 className="font-display text-3xl tracking-tighter text-on-surface md:text-4xl">
                You notice, but you&apos;re not sure.
              </h2>
              <p className="text-lg leading-relaxed text-balance font-light italic text-on-surface md:text-xl">
                &ldquo;Your cat has been lethargic all day. It&apos;s midnight on
                a Sunday. Is this a minor stomach bug or a life-threatening
                emergency?&rdquo;
              </p>
              <div className="mx-auto my-5 h-px w-20 bg-on-surface/20 lg:mx-0" />
              <p className="text-base leading-relaxed font-light text-on-surface-variant md:text-lg">
                Deciding when to rush to an emergency clinic shouldn&apos;t be a
                guessing game. PitsyPet bridges the gap between uncertainty and
                action with clinical-grade triage logic.
              </p>
            </div>
            {/* Image — left */}
            <div className="reveal order-1 flex justify-center lg:w-1/2" data-reveal-delay="140">
              <Image
                src="/cat1.png"
                alt="Cat"
                width={900}
                height={900}
                className="h-auto w-full max-w-md object-contain md:max-w-lg lg:max-h-[80vh] lg:max-w-xl lg:scale-110"
              />
            </div>
          </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="relative z-10 flex min-h-dvh snap-start items-center bg-surface-container-low"
        >
          <div className="mx-auto my-auto w-full max-w-5xl px-4 py-24">
          <div className="reveal mb-10 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-xl">
              <span className="mb-2 block text-sm font-bold tracking-widest text-brand uppercase">
                Our process
              </span>
              <h2 className="font-display text-4xl leading-none tracking-tight text-brand md:text-5xl">
                Three steps to clarity
              </h2>
            </div>
            <p className="max-w-xs font-light text-on-surface-variant">
              From worry to professional guidance in under three minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
            <div className="reveal group flex flex-col justify-between rounded-[3rem] border border-outline-variant/20 bg-surface-container-low p-10 transition-all hover:scale-105 hover:border-brand/20 md:col-span-4">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
                <PencilLine className="h-8 w-8 text-brand" />
              </div>
              <div>
                <h3 className="mb-4 font-display text-2xl text-brand">
                  1. Describe symptoms
                </h3>
                <p className="leading-relaxed font-light text-on-surface-variant">
                  Tell us what&apos;s happening in plain English — from
                  &ldquo;limping&rdquo; to subtle behavioural changes.
                </p>
              </div>
            </div>
            <div className="reveal-fade relative flex translate-y-6 flex-col justify-between rounded-[3rem] bg-brand p-10 text-white transition-all hover:scale-105 md:col-span-4 md:translate-y-10" data-reveal-delay="120">
              <Image
                src="/cartoon1.png"
                alt=""
                aria-hidden
                width={500}
                height={500}
                className="pointer-events-none absolute bottom-full left-1/2 h-auto w-28 -translate-x-1/2 translate-y-8 object-contain drop-shadow-xl md:w-36"
              />
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="mb-4 font-display text-2xl text-surface-bright">
                  2. AI analysis
                </h3>
                <p className="leading-relaxed font-light text-white/70">
                  Our engine cross-references veterinary knowledge and clinical
                  protocols to weigh how serious the situation is.
                </p>
              </div>
            </div>
            <div className="reveal group flex flex-col justify-between rounded-[3rem] border border-outline-variant/20 bg-surface-container-low p-10 transition-all hover:scale-105 hover:border-brand/20 md:col-span-4" data-reveal-delay="240">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
                <Stethoscope className="h-8 w-8 text-brand" />
              </div>
              <div>
                <h3 className="mb-4 font-display text-2xl text-brand">
                  3. Risk assessment
                </h3>
                <p className="leading-relaxed font-light text-on-surface-variant">
                  Get an immediate Low / Medium / High risk rating with clear
                  reasoning and the right next step.
                </p>
              </div>
            </div>
          </div>
          <div className="h-6 md:h-10" />
          </div>
        </section>

        {/* Features / available services */}
        <section className="relative z-10 flex min-h-dvh snap-start items-center bg-white pt-24 pb-16">
          <div className="mx-auto my-auto w-full max-w-5xl px-4">
            <div className="reveal mb-8 text-center">
              <h2 className="mb-4 font-display text-4xl tracking-tight text-brand md:text-5xl">
                Everything your pet&apos;s health needs
              </h2>
              <p className="mx-auto max-w-lg font-light text-on-surface-variant">
                One tool for triage, records, and peace of mind.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:auto-rows-[116px] md:grid-cols-12">
              <div className="reveal group glass-card relative flex flex-col justify-center overflow-hidden rounded-[2.5rem] border border-outline-variant/20 p-8 transition-all hover:scale-105 hover:border-brand/20 md:col-span-8 md:row-span-2">
                <Siren className="mb-4 h-10 w-10 text-brand" />
                <h3 className="mb-2 font-display text-3xl leading-none text-brand">
                  AI triage engine
                </h3>
                <p className="text-lg font-light text-on-surface-variant">
                  Just describe what&apos;s worrying you in plain language. The AI
                  understands your pet&apos;s symptoms as you chat and tells you
                  whether it&apos;s safe to watch at home, worth booking a vet, or
                  a real emergency — always erring toward caution when it counts.
                </p>
              </div>
              <div className="reveal-fade relative flex flex-col justify-center gap-4 rounded-[2.5rem] border border-outline-variant/20 bg-surface-container-high p-8 transition-all hover:scale-105 hover:border-brand/20 md:col-span-4 md:row-span-2" data-reveal-delay="100">
                <Image
                  src="/cartoon2.png"
                  alt=""
                  aria-hidden
                  width={500}
                  height={500}
                  className="pointer-events-none absolute -right-3 -top-8 h-auto w-20 object-contain drop-shadow-lg md:w-24"
                />
                <Brain className="h-10 w-10 text-brand-secondary" />
                <div>
                  <h4 className="mb-2 font-display text-2xl leading-none text-brand">
                    Risk reasoning
                  </h4>
                  <p className="text-sm leading-relaxed font-light text-on-surface-variant">
                    Every answer is grounded in real veterinary knowledge, not
                    guesswork. The AI explains its reasoning in plain English, so
                    you understand why it matters and can act with confidence.
                  </p>
                </div>
              </div>
              <div className="reveal rounded-[2rem] border border-outline-variant/20 bg-secondary-container/30 p-8 transition-all hover:scale-105 hover:border-brand/20 md:col-span-4 md:row-span-2" data-reveal-delay="180">
                <HeartPulse className="mb-4 block h-10 w-10 text-brand" />
                <h4 className="mb-2 font-display text-xl text-brand">
                  First-aid guides
                </h4>
                <p className="text-sm leading-relaxed font-light text-on-surface-variant">
                  Safe steps to stabilise your pet before you reach a vet, plus
                  24/7 emergency contacts for your state.
                </p>
              </div>
              <div className="reveal glass-card rounded-[2rem] border border-outline-variant/20 p-8 transition-all hover:scale-105 hover:border-brand/20 md:col-span-4 md:row-span-2" data-reveal-delay="260">
                <Users className="mb-4 block h-10 w-10 text-brand" />
                <h4 className="mb-2 font-display text-xl text-brand">
                  Multi-pet clinical hub
                </h4>
                <p className="text-sm leading-relaxed font-light text-on-surface-variant">
                  Medications, vet clinics, appointments and follow-ups for every
                  pet in one place.
                </p>
              </div>
              <div className="reveal rounded-[2rem] border border-outline-variant/20 bg-secondary-container/20 p-8 transition-all hover:scale-105 hover:border-brand/20 md:col-span-4 md:row-span-2" data-reveal-delay="340">
                <FileText className="mb-4 block h-10 w-10 text-brand-secondary" />
                <h4 className="mb-2 font-display text-xl text-brand">
                  Vet PDF export
                </h4>
                <p className="text-sm leading-relaxed font-light text-on-surface-variant">
                  Generate a professional handover report to share instantly with
                  your local veterinarian.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why us */}
        <section id="why-us" className="relative z-10 flex min-h-dvh snap-start items-center overflow-hidden bg-surface-container-low pt-24 pb-16">
          <div className="organic-blob right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-brand-container/20" />
          <div className="mx-auto my-auto w-full max-w-5xl px-4">
            <div className="flex flex-col items-center gap-16 lg:flex-row">
              <div className="reveal order-2 flex justify-center lg:order-1 lg:w-1/2">
                <Image
                  src="/cartoon3.png"
                  alt="Happy, healthy dog"
                  width={600}
                  height={600}
                  className="h-auto w-full max-w-md object-contain drop-shadow-xl md:max-w-lg lg:max-w-xl lg:scale-110"
                />
              </div>
              <div className="reveal order-1 space-y-8 lg:order-2 lg:w-1/2" data-reveal-delay="140">
                <h2 className="font-display text-4xl leading-none tracking-tight text-brand md:text-5xl">
                  A safety-first approach
                </h2>
                <p className="text-xl leading-relaxed font-light text-on-surface-variant">
                  PitsyPet isn&apos;t a replacement for a vet — it&apos;s the
                  bridge to one. Our triage logic is calibrated with a practising
                  veterinarian.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "A deterministic safety override always escalates a genuine emergency — it can never lower a result.",
                    "A rule-based backup keeps triage working even if the AI is unavailable.",
                    "Privacy-first: your pet's clinical data is encrypted and isolated per account.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/10">
                        <Check className="h-4 w-4 text-brand" />
                      </div>
                      <span className="font-light text-on-surface">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency locator */}
        <section className="relative z-10 flex min-h-dvh snap-start items-center bg-white">
          <div className="mx-auto my-auto w-full max-w-5xl px-4 pt-24 pb-16">
          <div className="reveal mb-8 text-center">
            <span className="mb-2 block text-sm font-bold tracking-widest text-error uppercase">
              Emergency support
            </span>
            <h2 className="font-display text-4xl tracking-tight text-brand md:text-5xl">
              Find help immediately
            </h2>
            <p className="mt-4 font-light text-on-surface-variant">
              For high-risk results, we surface 24/7 emergency clinics for your
              state.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Interactive map — Leaflet + OpenStreetMap, real clinic pins.
                `isolate` contains Leaflet's internal z-index so it can't paint
                over the fixed navbar. */}
            <div className="reveal-fade isolate h-[320px] overflow-hidden rounded-[2.5rem] border border-outline-variant/30 shadow-xl lg:col-span-3 lg:h-[440px]">
              <EmergencyMap />
            </div>
            {/* Real clinic list — click-to-call, scrolls independently on desktop */}
            <div className="reveal flex flex-col gap-3 lg:col-span-2 lg:h-[440px] lg:overflow-y-auto lg:pr-1" data-reveal-delay="140">
              {EMERGENCY_CLINICS.map((c) => (
                <a
                  key={c.name}
                  href={`tel:${c.phone.replace(/\s+/g, "")}`}
                  className="glass-card group flex items-center gap-3 rounded-2xl border border-outline-variant/20 p-3 transition-all hover:scale-[1.02] hover:border-brand/20 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand/10 text-xs font-bold text-brand">
                    {c.state === "ALL" ? "AU" : c.state}
                  </span>
                  <div className="min-w-0 flex-grow">
                    <p className="truncate text-sm font-bold text-brand">
                      {c.name}
                    </p>
                    <p className="truncate text-xs font-light text-on-surface-variant">
                      {c.address}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-brand transition-colors group-hover:text-brand-container">
                    <Phone className="h-4 w-4" />
                    <span className="hidden xl:inline">{c.phone}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="relative z-10 flex min-h-dvh snap-start items-center bg-surface-container-low pt-24 pb-16">
          <div className="mx-auto my-auto w-full max-w-5xl px-4">
            <div className="reveal mb-8 text-center">
              <h2 className="font-display text-4xl tracking-tight text-brand md:text-5xl">
                Simple, transparent plans
              </h2>
              <p className="mt-2 text-lg font-light text-on-surface-variant">
                Free to start. Upgrade only if you want more.
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-8 md:grid-cols-2">
              {/* Free */}
              <div className="reveal glass-card flex flex-col rounded-[2.5rem] border border-outline-variant/30 p-8 transition-all hover:scale-105 hover:border-brand/20 hover:shadow-xl">
                <h3 className="font-display text-2xl text-brand opacity-60">
                  PitsyBasic
                </h3>
                <div className="my-6">
                  <span className="text-5xl font-black text-brand">$0</span>
                  <span className="ml-2 font-light text-on-surface-variant">
                    /forever
                  </span>
                </div>
                <ul className="mb-8 flex-grow space-y-4">
                  {[
                    "2 AI triage sessions / month",
                    "First-aid steps & emergency vet contacts",
                    "2 vet PDF exports / month",
                    "1 pet profile",
                    "24/7 access, any device",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-4 text-sm font-light"
                    >
                      <CircleCheck className="h-5 w-5 text-brand/40" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="w-full rounded-2xl border border-brand/20 py-4 text-center font-bold text-brand transition-all hover:bg-white"
                >
                  Start free
                </Link>
              </div>

              {/* Premium */}
              <div className="reveal-fade pricing-glow relative flex flex-col rounded-[2.5rem] bg-brand p-8 transition-all hover:scale-105" data-reveal-delay="120">
                <Image
                  src="/cartoon7.png"
                  alt=""
                  aria-hidden
                  width={500}
                  height={500}
                  className="pointer-events-none absolute bottom-full right-3 h-auto w-28 translate-y-9 object-contain drop-shadow-xl md:w-32"
                />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-[10px] font-bold tracking-widest text-white uppercase shadow-lg ring-1 ring-white/20">
                  Most popular
                </div>
                <h3 className="font-display text-2xl text-white">
                  PitsyPremium
                </h3>
                <div className="my-6">
                  <span className="text-5xl font-black text-white">$9.99</span>
                  <span className="ml-2 font-light text-white/60">/month</span>
                </div>
                <ul className="mb-8 flex-grow space-y-4">
                  {[
                    "Everything in Basic, unlimited",
                    "Unlimited pets",
                    "Unlimited records & clinical history",
                    "Vet PDF reports",
                    "Priority support",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-4 text-sm font-medium text-white"
                    >
                      <BadgeCheck className="h-5 w-5 text-secondary-fixed" />
                      {f}
                    </li>
                  ))}
                </ul>
                {/* Wired to Stripe Checkout (test mode) in a later step. */}
                <Link
                  href="/register"
                  className="w-full rounded-2xl bg-white py-4 text-center text-lg font-bold text-brand shadow-xl shadow-black/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Go Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="relative z-10 flex min-h-dvh snap-start items-center bg-white"
        >
          <div className="mx-auto my-auto w-full max-w-5xl px-4 pt-24 pb-56">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
            <div className="reveal space-y-8 lg:col-span-5">
              <h2 className="font-display text-4xl leading-none tracking-tight text-brand md:text-5xl">
                Get in touch
              </h2>
              <p className="text-lg leading-relaxed font-light text-on-surface-variant">
                Questions about how PitsyPet works, or partnership enquiries? Our
                team is here to help.
              </p>
              <div className="space-y-8 pt-4">
                <div className="group flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/5 transition-colors group-hover:bg-brand">
                    <Mail className="h-6 w-6 text-brand transition-colors group-hover:text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-widest text-brand uppercase">
                      Email us
                    </p>
                    <p className="text-lg">support@pitsypet.com.au</p>
                  </div>
                </div>
                <div className="group flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/5 transition-colors group-hover:bg-brand">
                    <MapPin className="h-6 w-6 text-brand transition-colors group-hover:text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-widest text-brand uppercase">
                      Location
                    </p>
                    <p className="text-lg">Sydney, NSW, Australia</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="reveal lg:col-span-7" data-reveal-delay="140">
              <div className="glass-card relative overflow-hidden rounded-[3rem] border border-outline-variant/30 p-10 shadow-2xl md:p-12">
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand/5" />
                <ContactForm />
              </div>
            </div>
          </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 -mt-12 rounded-t-[3rem] bg-surface-container-low pt-24 pb-8 md:-mt-16 md:rounded-t-[4rem]">
        <Image
          src="/cartoon8.png"
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          className="pointer-events-none absolute bottom-full left-1/2 h-auto w-[85%] max-w-3xl -translate-x-1/2 translate-y-1/3 object-contain"
        />
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-8 grid grid-cols-1 gap-16 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="mb-4 font-display text-3xl font-black tracking-tighter text-brand">
                PitsyPet
              </div>
              <p className="max-w-sm text-lg leading-relaxed font-light text-on-surface-variant">
                Helping Australian pet owners judge how urgent a symptom is —
                with safety-first AI triage.
              </p>
              <div className="mt-8 flex gap-4">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-brand hover:text-white"
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
                  className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-brand hover:text-white"
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
                  className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-brand hover:text-white"
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
                  <a href="#" className="transition-colors hover:text-brand">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-brand">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#contact" className="transition-colors hover:text-brand">
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
                    href="#how-it-works"
                    className="transition-colors hover:text-brand"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#why-us" className="transition-colors hover:text-brand">
                    Why us
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-brand">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-6 border-t border-outline-variant/10 pt-8 md:flex-row">
            <p className="text-[10px] font-bold tracking-[0.3em] text-on-surface-variant uppercase">
              ABN 00 000 000 000 (pending registration) · Sydney, Australia
            </p>
            <div className="max-w-xl space-y-2 text-center text-[10px] font-light text-on-surface-variant/70 md:text-right">
              <p>
                <strong>Disclaimer:</strong> PitsyPet is an educational triage
                tool only and does not replace professional veterinary diagnosis,
                advice, or treatment.
              </p>
              <p>
                This website/app is for a class assignment and not for commercial
                purposes.
              </p>
              <p>© 2026 PitsyPet.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
