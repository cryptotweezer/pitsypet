import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { SPECIES } from "@/lib/validations/pet";

// Breed autocomplete. ILIKE '%q%' is index-backed by the trigram GIN index on
// breeds(name). Lookup table is readable by any authenticated user (RLS).
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const speciesParam = searchParams.get("species");

  if (q.length < 1) {
    return NextResponse.json({ breeds: [] });
  }

  let query = supabase
    .from("breeds")
    .select("id, name, species")
    .ilike("name", `%${q}%`)
    .order("name", { ascending: true })
    .limit(10);

  if (speciesParam && (SPECIES as readonly string[]).includes(speciesParam)) {
    query = query.eq("species", speciesParam);
  }

  const { data: breeds, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to load breeds" }, { status: 500 });
  }

  return NextResponse.json({ breeds });
}
