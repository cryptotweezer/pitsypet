"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ initialError }: { initialError?: boolean }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(
    initialError ? "Could not sign you in. Please try again." : null,
  );

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        {serverError && (
          <p
            className="rounded-2xl bg-error-container px-4 py-3 text-sm font-medium text-error"
            role="alert"
          >
            {serverError}
          </p>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="mb-3 text-[10px] font-bold tracking-[0.2em] text-brand uppercase">
                Email address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-auto rounded-none border-0 border-b-2 border-outline-variant/20 bg-white px-0 py-3 text-lg placeholder:text-on-surface-variant/30 autofill:bg-white focus-visible:border-brand focus-visible:bg-white focus-visible:ring-0 aria-invalid:border-error aria-invalid:ring-0"
                  {...field}
                />
              </FormControl>
              <FormMessage className="mt-2 text-sm font-medium text-error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="mb-3 text-[10px] font-bold tracking-[0.2em] text-brand uppercase">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  className="h-auto rounded-none border-0 border-b-2 border-outline-variant/20 bg-white px-0 py-3 text-lg placeholder:text-on-surface-variant/30 autofill:bg-white focus-visible:border-brand focus-visible:bg-white focus-visible:ring-0 aria-invalid:border-error aria-invalid:ring-0"
                  {...field}
                />
              </FormControl>
              <FormMessage className="mt-2 text-sm font-medium text-error" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-auto w-full rounded-2xl bg-brand py-5 text-lg font-bold text-white hover:bg-brand hover:shadow-xl hover:shadow-brand/30"
        >
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
