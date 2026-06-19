import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// This is the ONLY Supabase client used by application code (Server Components
// and Route Handlers). It uses the anon key + the user's session cookies, so
// every query is constrained by RLS. The service-role key is never imported
// here — it lives only in scripts/ (ingestion).
export const createClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookies can't be set here.
            // The middleware refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
};
