import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { petSlug } from "@/lib/utils";

// Slugs that collide with static /pets/* routes.
const RESERVED = new Set(["new"]);

export function basePetSlug(name: string): string {
  const s = petSlug(name);
  return RESERVED.has(s) ? `${s}-pet` : s;
}

/**
 * Next free slug for `name` among the user's pets. Scans ALL rows (soft-
 * deleted included) so a later restore can't collide with a newer pet, even
 * though the unique index only enforces active rows. On rename, pass
 * `excludePetId` so the pet's own current slug doesn't count as taken.
 */
export async function nextPetSlug(
  supabase: SupabaseClient<Database>,
  userId: string,
  name: string,
  excludePetId?: string,
): Promise<string> {
  const base = basePetSlug(name);
  let query = supabase
    .from("pets")
    .select("slug")
    .eq("user_id", userId)
    .like("slug", `${base}%`);
  if (excludePetId) query = query.neq("pet_id", excludePetId);
  const { data } = await query;

  const rows = Array.isArray(data) ? data : [];
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
