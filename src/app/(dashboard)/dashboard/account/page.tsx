import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { DeleteAccountCard } from "@/components/dashboard/delete-account-card";

export const metadata = { title: "Account · PitsyPet" };

export default function AccountPage() {
  return (
    <section className="grid max-w-3xl gap-6">
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          ACCOUNT
        </span>
        <h1 className="font-display text-3xl tracking-tight text-brand">
          Your account
        </h1>
        <p className="font-light text-on-surface-variant">
          Manage your privacy and control the information you keep in PitsyPet.
        </p>
      </div>

      <div className="rounded-[2.5rem] border border-outline-variant/20 bg-white p-8 md:p-10">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl tracking-tight text-brand">
              Your data stays under your control
            </h2>
            <p className="mt-2 text-sm leading-relaxed font-light text-on-surface-variant">
              PitsyPet does not sell your information or use it for advertising
              or research. Read how data is handled, stored and deleted in our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <DeleteAccountCard />
    </section>
  );
}
