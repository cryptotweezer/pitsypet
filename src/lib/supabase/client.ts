import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Browser client for Client Components. Uses the anon key; all access is
// constrained by RLS through the user's session cookies.
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
