import Image from "next/image";
import { Mail } from "lucide-react";

import { ContactForm } from "@/components/landing/contact-form";

export const metadata = { title: "Help · PitsyPet" };

export default function DashboardHelpPage() {
  return (
    <section className="grid max-w-3xl gap-6">
      <div className="relative grid gap-1.5 sm:pr-44">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          HELP
        </span>
        <h1 className="font-display text-3xl tracking-tight text-brand">
          Get in touch
        </h1>
        <p className="font-light text-on-surface-variant">
          Questions about how PitsyPet works, feedback, or a problem with your
          account? Send us a message and we&apos;ll get back to you.
        </p>
        <p className="flex items-center gap-2 pt-1 text-sm text-on-surface-variant">
          <Mail className="size-4 text-brand" aria-hidden />
          support@pitsypet.com.au
        </p>
        <Image
          src="/cartoon10.webp"
          alt=""
          aria-hidden
          width={320}
          height={320}
          className="pointer-events-none absolute top-0 right-0 hidden h-auto w-36 select-none sm:block lg:w-40"
        />
      </div>
      <div className="rounded-[2.5rem] border border-outline-variant/20 bg-white p-8 md:p-10">
        <ContactForm />
      </div>
    </section>
  );
}
