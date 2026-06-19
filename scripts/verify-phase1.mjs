import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  const env = {};

  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) {
      continue;
    }

    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }

  return env;
}

const env = loadEnv(".env.local");
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const checks = [];

async function countTable(name) {
  const { count, error } = await supabase
    .from(name)
    .select("*", { count: "exact", head: true });

  checks.push({
    check: name,
    count,
    ok: !error,
    error: error?.message,
  });
}

await countTable("breeds");
await countTable("emergency_contacts");
await countTable("profiles");

const { error: searchAssessmentsError } = await supabase.rpc(
  "search_assessments",
  { query_text: "vomiting", match_count: 1 },
);
checks.push({
  check: "rpc search_assessments",
  ok: !searchAssessmentsError,
  error: searchAssessmentsError?.message,
});

const zeroVector = `[${Array(1536).fill(0).join(",")}]`;
const { error: searchKnowledgeError } = await supabase.rpc(
  "search_veterinary_knowledge",
  { query_embedding: zeroVector, match_species: "Dog", match_count: 1 },
);
checks.push({
  check: "rpc search_veterinary_knowledge",
  ok: !searchKnowledgeError,
  error: searchKnowledgeError?.message,
});

console.log(JSON.stringify(checks, null, 2));
