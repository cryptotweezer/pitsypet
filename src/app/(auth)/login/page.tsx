import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in · PitsyPet" };

export default async function LoginPage(
  props: {
    searchParams: Promise<{ error?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  return (
    <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center overflow-x-clip p-4 sm:min-h-[calc(100dvh-7rem)]">
      <div className="relative w-full max-w-lg">
        <Card
          className="w-full gap-8 rounded-[3rem] border border-outline-variant/30 bg-white py-10 text-on-surface shadow-2xl ring-0 [--card-spacing:0]"
          size="default"
        >
          <CardHeader className="gap-3 px-8 sm:px-10">
            <CardTitle className="font-display text-3xl leading-tight font-bold text-brand">
              Welcome back
            </CardTitle>
            <CardDescription className="text-base leading-relaxed font-light text-on-surface-variant">
              Sign in to continue to your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 px-8 sm:px-10">
            <LoginForm initialError={Boolean(searchParams?.error)} />
            <p className="text-sm font-light text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
        <Image
          src="/cartoon13.png"
          alt=""
          aria-hidden="true"
          width={500}
          height={500}
          className="pointer-events-none absolute top-1/2 left-full z-10 hidden h-auto w-80 -translate-x-[45%] -translate-y-1/2 object-contain drop-shadow-xl lg:block lg:w-[29rem]"
        />
      </div>
    </main>
  );
}
