import fs from "node:fs";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "../src/types/database";
import { embedText, buildRagQuery } from "../src/lib/ai/embed";
import { rankChunks, type KnowledgeChunk } from "../src/lib/ai/rag";

// RAG retrieval smoke test. Runs the EXACT runtime path (buildRagQuery ->
// embedText -> search_veterinary_knowledge -> rankChunks) against the ingested
// knowledge base and prints what the classifier would actually be grounded on.
// Read-only: it never writes. Run with:  npx tsx scripts/rag-smoke.ts
//
// Uses the service-role key like the ingest script, because there is no user
// session here. It must never be imported into src/.

function loadEnv(file: string): void {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnv(".env.local");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY || !process.env.OPENAI_API_KEY) {
  console.error("Missing Supabase or OpenAI env vars in .env.local");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Realistic owner presentations, spanning the three risk levels.
const CASES: { label: string; species: string; breed: string; symptoms: string[] }[] = [
  {
    label: "respiratory distress (expect High)",
    species: "Dog",
    breed: "Pug",
    symptoms: ["difficulty breathing", "blue gums"],
  },
  {
    label: "seizure (expect High)",
    species: "Dog",
    breed: "Labrador",
    symptoms: ["seizure", "disoriented afterwards"],
  },
  {
    label: "collapse and bleeding (expect High)",
    species: "Dog",
    breed: "Greyhound",
    symptoms: ["collapsed at home", "bleeding from a wound"],
  },
  {
    label: "single vomit, otherwise well (expect Medium)",
    species: "Dog",
    breed: "Beagle",
    symptoms: ["vomited once", "eating and drinking normally"],
  },
  {
    label: "cat unable to urinate (expect High)",
    species: "Cat",
    breed: "Domestic Shorthair",
    symptoms: ["straining to urinate", "repeated litter tray visits"],
  },
  {
    label: "mild itching (expect Low)",
    species: "Dog",
    breed: "Border Collie",
    symptoms: ["itching", "scratching an ear"],
  },
];

async function run(): Promise<void> {
  console.log(`Knowledge base: ${new URL(SUPABASE_URL!).host}\n`);

  for (const c of CASES) {
    const query = buildRagQuery(c.species, c.breed, c.symptoms);
    const embedding = await embedText(query);

    const { data, error } = await supabase.rpc("search_veterinary_knowledge", {
      query_embedding: `[${embedding.join(",")}]`,
      match_species: c.species,
      match_count: 12,
    });

    console.log("=".repeat(76));
    console.log(c.label);
    console.log(`query: ${query}`);
    if (error) {
      console.log(`  RPC ERROR: ${error.message}`);
      continue;
    }
    const raw = (data ?? []) as KnowledgeChunk[];
    const ranked = rankChunks(raw);
    console.log(`  raw matches: ${raw.length} -> after filter/re-rank/diversify: ${ranked.length}`);
    if (ranked.length === 0) {
      console.log("  NOTHING RETRIEVED (classification would proceed without RAG)");
      continue;
    }
    for (const ch of ranked) {
      const preview = ch.text.replace(/\s+/g, " ").slice(0, 170);
      console.log(
        `  [sim ${ch.similarity.toFixed(3)} | urgency ${ch.urgency_level} | ${ch.body_system ?? "no system"} | ${ch.source}]`,
      );
      console.log(`    ${preview}...`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
