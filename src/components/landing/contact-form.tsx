"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      // A redirect (e.g. auth middleware → /login) would otherwise land on a
      // 200 HTML page and be misread as success. Treat it as a failure.
      if (res.redirected) {
        setError("Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="relative z-10 flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-8 w-8 text-brand"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="font-display text-2xl text-brand">Message sent!</h3>
        <p className="max-w-xs font-light text-on-surface-variant">
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
      {/* Honeypot — hidden from users, catches bots. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Company
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-3 block text-[10px] font-bold tracking-[0.2em] text-brand uppercase"
          >
            Full name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full border-0 border-b-2 border-outline-variant/20 bg-white/50 px-0 py-3 text-lg transition-all placeholder:text-on-surface-variant/30 focus:border-brand focus:ring-0"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-3 block text-[10px] font-bold tracking-[0.2em] text-brand uppercase"
          >
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full border-0 border-b-2 border-outline-variant/20 bg-white/50 px-0 py-3 text-lg transition-all placeholder:text-on-surface-variant/30 focus:border-brand focus:ring-0"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="contact-message"
          className="mb-3 block text-[10px] font-bold tracking-[0.2em] text-brand uppercase"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={3}
          required
          maxLength={3000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          className="w-full border-0 border-b-2 border-outline-variant/20 bg-white/50 px-0 py-3 text-lg transition-all placeholder:text-on-surface-variant/30 focus:border-brand focus:ring-0"
        />
      </div>

      {status === "error" && error && (
        <p role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-2xl bg-brand py-5 text-lg font-bold text-white transition-all hover:shadow-xl hover:shadow-brand/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
