import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Create account · PitsyPet" };

// Dynamic so the page receives the middleware's per-request CSP nonce — our
// 'strict-dynamic' script-src would otherwise block this page's build-time
// static scripts. See src/lib/security/csp.ts.
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center overflow-x-clip p-4 sm:min-h-[calc(100dvh-7rem)]">
      <div className="relative w-full max-w-lg">
        <Card
          className="min-h-[32rem] w-full gap-5 rounded-[3rem] border border-outline-variant/30 bg-white py-7 text-on-surface shadow-2xl ring-0 [--card-spacing:0] sm:gap-7 sm:py-9"
          size="default"
        >
          <CardHeader className="gap-3 px-7 sm:px-10">
            <CardTitle className="font-display text-3xl leading-tight font-bold text-brand">
              Create your account
            </CardTitle>
            <CardDescription className="text-base leading-relaxed font-light text-on-surface-variant">
              Start triaging your pet&apos;s symptoms in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 px-7 sm:gap-5 sm:px-10">
            <RegisterForm />
            <p className="text-sm font-light text-on-surface-variant">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
        <Image
          src="/cartoon14.png"
          alt=""
          aria-hidden="true"
          width={500}
          height={500}
          className="pointer-events-none absolute top-1/2 left-full z-10 hidden h-auto w-64 -translate-x-[36%] -translate-y-1/2 object-contain drop-shadow-xl lg:block lg:w-[29rem]"
        />
      </div>
    </main>
  );
}
