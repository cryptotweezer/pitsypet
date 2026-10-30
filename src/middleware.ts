import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except static assets and image files. The session is
    // refreshed on each navigation so access tokens never silently expire.
    // /api/health is skipped too: the uptime probe has no session, and every
    // middleware run spends Fluid Active CPU on the Hobby plan.
    "/((?!_next/static|_next/image|favicon.ico|api/health$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
