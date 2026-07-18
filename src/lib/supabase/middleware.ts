import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { buildCsp } from "@/lib/security/csp";

export async function updateSession(request: NextRequest) {
  // Per-request CSP nonce. Next.js reads it from the request's
  // Content-Security-Policy header and stamps it onto its own inline scripts,
  // so hydration works while attacker-injected <script>s are blocked.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, process.env.NODE_ENV !== "production");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() triggers a refresh of an expired access token and
  // re-issues the auth cookies onto `response`. Do not remove this call, and do
  // not run code between createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path.startsWith("/login") || path.startsWith("/register");
  // Unauthenticated public endpoints — must not redirect to /login:
  // /api/health is the uptime probe; /api/contact is the public landing form;
  // /api/billing/webhook is Stripe's server-to-server callback (authenticated
  // by its own signature check, not a session).
  const isPublic =
    path === "/" ||
    path.startsWith("/auth") ||
    path === "/api/health" ||
    path === "/api/contact" ||
    path === "/api/billing/webhook";

  if (!user && !isAuthRoute && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // The CSP must also ride on the response so the browser enforces it.
  response.headers.set("Content-Security-Policy", csp);
  return response;
}
