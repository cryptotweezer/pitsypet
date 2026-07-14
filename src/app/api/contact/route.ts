import { NextResponse, type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

import { contactRateLimiter } from "@/lib/rate-limit";

// Nodemailer needs Node APIs (net/tls), so this route must run on the Node.js
// runtime, not the Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("A valid email is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(3000),
  // Honeypot: a hidden field real users never fill. Bots that autofill it are
  // silently accepted (we return 200 but send nothing).
  company: z.string().max(0).optional().or(z.literal("")),
});

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

// POST /api/contact — landing "Get in touch" form. Sends the enquiry to the
// site owner's inbox via Gmail SMTP (App Password). `from` is the owner's own
// Gmail (Gmail requires the authenticated user as sender); the visitor's
// address goes in reply-to so the owner can reply directly.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }
  const { name, email, message, company } = parsed.data;

  // Honeypot tripped → pretend success, send nothing.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const { success } = await contactRateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json(
      { error: "Too many messages — please try again later." },
      { status: 429 },
    );
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.CONTACT_TO_EMAIL || gmailUser;

  if (!gmailUser || !gmailPass || !to) {
    console.error("[contact] Missing GMAIL_USER / GMAIL_APP_PASSWORD env vars");
    return NextResponse.json(
      { error: "Email is not configured. Please try again later." },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
  });

  try {
    const info = await transporter.sendMail({
      from: `"PitsyPet Contact" <${gmailUser}>`,
      to,
      replyTo: `"${name}" <${email}>`,
      subject: `New PitsyPet enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#1e1a21">
          <h2 style="color:#450076;margin:0 0 16px">New enquiry from the PitsyPet landing page</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <p style="margin-top:16px;white-space:pre-wrap;border-left:3px solid #e6c5fe;padding-left:12px">${escapeHtml(
            message,
          )}</p>
        </div>`,
    });
    // Ground-truth of what Gmail's SMTP actually did with the message.
    console.log("[contact] sent:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      to,
    });
  } catch (err) {
    console.error("[contact] sendMail failed:", err);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
