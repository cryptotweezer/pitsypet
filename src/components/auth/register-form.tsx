"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { AU_STATES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or fewer"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number")
    .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
  state: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", state: undefined },
  });

  async function onSubmit(values: RegisterValues) {
    setServerError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name, state: values.state ?? null },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setServerError("Email already registered. Try logging in instead.");
      } else if (msg.includes("password")) {
        setServerError("Password too weak. Please choose a stronger password.");
      } else {
        setServerError("Something went wrong. Please try again.");
      }
      return;
    }

    // Supabase returns an empty identities array for an existing confirmed email.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setServerError("Email already registered. Try logging in instead.");
      return;
    }

    setSubmitted(true);
  }

  // Name/email live on step 1 and are not rendered on step 2, so their errors
  // would be invisible — send the user back to the step that owns them.
  function onInvalid(errors: FieldErrors<RegisterValues>) {
    if (errors.name || errors.email) setStep(1);
  }

  async function advanceToAccountSetup() {
    const isValid = await form.trigger(["name", "email"], {
      shouldFocus: true,
    });

    if (isValid) {
      setStep(2);
    }
  }

  function returnToDetails() {
    setServerError(null);
    setStep(1);
  }

  if (submitted) {
    return (
      <div
        className="flex flex-1 flex-col justify-center py-4"
        role="status"
      >
        <p className="font-display text-xl font-semibold text-brand">
          Check your email to activate your account.
        </p>
        <p className="mt-2 text-base leading-relaxed font-light text-on-surface-variant">
          We sent a confirmation link to your inbox. Click it to finish setting
          up your PitsyPet account.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={
          step === 1
            ? (event) => {
                event.preventDefault();
                void advanceToAccountSetup();
              }
            : form.handleSubmit(onSubmit, onInvalid)
        }
        className="grid gap-5"
      >
        <div>
          <div
            className="mb-2 flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-brand uppercase"
            aria-live="polite"
          >
            <span>Step {step} of 2</span>
            <span>{step === 1 ? "Your details" : "Account setup"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2" aria-hidden="true">
            <span className="h-1 rounded-full bg-brand" />
            <span
              className={`h-1 rounded-full ${
                step === 2 ? "bg-brand" : "bg-outline-variant/40"
              }`}
            />
          </div>
        </div>

        {serverError && (
          <p
            className="rounded-2xl bg-error-container px-4 py-3 text-sm font-medium text-error"
            role="alert"
          >
            {serverError}
          </p>
        )}

        {step === 1 ? (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="mb-3 text-[10px] font-bold tracking-[0.2em] text-brand uppercase">
                    Full name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jane Doe"
                      autoComplete="name"
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
              name="email"
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="mb-3 text-[10px] font-bold tracking-[0.2em] text-brand uppercase">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      autoComplete="email"
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
              className="h-auto w-full rounded-2xl bg-brand py-5 text-lg font-bold text-white hover:bg-brand hover:shadow-xl hover:shadow-brand/30"
            >
              Continue
            </Button>
          </>
        ) : (
          <>
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
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      autoFocus
                      className="h-auto rounded-none border-0 border-b-2 border-outline-variant/20 bg-white px-0 py-3 text-lg placeholder:text-on-surface-variant/30 autofill:bg-white focus-visible:border-brand focus-visible:bg-white focus-visible:ring-0 aria-invalid:border-error aria-invalid:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="mt-3 text-sm leading-relaxed font-light text-on-surface-variant">
                    Use upper and lower case, a number, and a special character.
                  </FormDescription>
                  <FormMessage className="mt-2 text-sm font-medium text-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="mb-3 text-[10px] font-bold tracking-[0.2em] text-brand uppercase">
                    State (optional)
                  </FormLabel>
                  <Select
                    value={field.value ?? null}
                    onValueChange={(value) =>
                      field.onChange(value ?? undefined)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="h-auto w-full rounded-none border-0 border-b-2 border-outline-variant/20 bg-white px-0 py-3 text-lg focus-visible:border-brand focus-visible:bg-white focus-visible:ring-0 data-placeholder:text-on-surface-variant/30 aria-invalid:border-error aria-invalid:ring-0">
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AU_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="mt-3 text-sm leading-relaxed font-light text-on-surface-variant">
                    Helps us show local emergency vet contacts later.
                  </FormDescription>
                  <FormMessage className="mt-2 text-sm font-medium text-error" />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={returnToDetails}
                className="h-auto w-14 self-stretch rounded-2xl border-brand/20 text-brand hover:bg-brand/5 hover:text-brand"
                aria-label="Back to your details"
                title="Back"
              >
                <ArrowLeft />
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-auto flex-1 rounded-2xl bg-brand py-5 text-lg font-bold text-white hover:bg-brand hover:shadow-xl hover:shadow-brand/30"
              >
                {form.formState.isSubmitting
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
