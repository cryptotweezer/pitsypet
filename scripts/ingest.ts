import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

import type { Database } from "../src/types/database";
import { cleanText, chunkText } from "./chunk";
import { embedBatch } from "../src/lib/ai/embed";

// RAG ingestion (Phase 4). Run with:  npm run ingest
// (No TLS flag needed: the dev machine trusts the Norton interception CA via the
// user-level NODE_OPTIONS=--use-system-ca env var — see CLAUDE.md. Never use
// NODE_TLS_REJECT_UNAUTHORIZED=0, which disables verification entirely.)
//
// This is the ONLY place SUPABASE_SERVICE_ROLE_KEY is used. It bypasses RLS to
// bulk-insert knowledge chunks; it must never be imported into src/.

const SOURCES_DIR = path.join(process.cwd(), "scripts", "sources");
const EMBED_BATCH = 96; // chunks per OpenAI embedding request
const INSERT_BATCH = 100; // rows per Supabase insert

// ---- env (manual loader so we don't add a dotenv dependency) ----
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
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env.local (needed for embeddings)");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ---- metadata heuristics (re-rank signals only, never retrieval gates) ----
const CRITICAL_RE =
  /seizure|seizing|convuls|difficulty breathing|can'?t breathe|not breathing|collapse|unconscious|unresponsive|bloat|gdv|gastric dilat|poison|toxic|haemorrhage|hemorrhage|anaphyla|blue gums|cyanosis|blocked bladder|urinary obstruction|heatstroke|hit by car|trauma/i;
const SERIOUS_RE =
  /vomit|diarrh|bleeding|fever|letharg|severe|infection|fracture|wound|dehydrat|swelling|dystocia|labou?r/i;

const SYSTEMS: [RegExp, string][] = [
  [/breath|respir|lung|cough|pneumonia|nasal|airway/i, "respiratory"],
  [/vomit|diarrh|stomach|intestin|gastro|bowel|liver|pancrea|abdomen/i, "gastrointestinal"],
  [/heart|cardiac|cardio|pulse|circulat/i, "cardiovascular"],
  [/seizure|neuro|brain|spinal|paralys|tremor|nerve/i, "neurological"],
  [/bladder|kidney|renal|urin|urethra/i, "urinary"],
  [/skin|derm|coat|itch|allerg|wound|paw|flea/i, "dermatological"],
  [/bone|joint|limp|fracture|muscle|musculo|ligament|lameness/i, "musculoskeletal"],
  [/\beye|ocular|vision|cornea|retina/i, "ophthalmic"],
  [/\bear|otitis|hearing/i, "aural"],
  [/tooth|teeth|dental|\bgum|oral/i, "dental"],
];

function speciesFor(text: string): "Dog" | "Cat" | "Both" {
  const cat = /\b(cat|cats|feline|kitten|queen)\b/i.test(text);
  const dog = /\b(dog|dogs|canine|puppy|puppies|bitch)\b/i.test(text);
  if (cat && !dog) return "Cat";
  if (dog && !cat) return "Dog";
  return "Both"; // safe default — 'Both' always matches the species filter
}

function urgencyFor(text: string): number {
  if (CRITICAL_RE.test(text)) return 9;
  if (SERIOUS_RE.test(text)) return 6;
  return 3;
}

function bodySystemFor(text: string): string | null {
  for (const [re, system] of SYSTEMS) {
    if (re.test(text)) return system;
  }
  return null;
}

function breedSpecificFor(text: string): boolean {
  return /breed|brachycephalic|predispos|prone to|hereditary|genetic disorder/i.test(text);
}

function toVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

async function extractText(filePath: string): Promise<string> {
  if (/\.pdf$/i.test(filePath)) {
    const { text } = await pdfParse(fs.readFileSync(filePath));
    return text;
  }
  return fs.readFileSync(filePath, "utf8");
}

async function ingestFile(file: string): Promise<number> {
  const filePath = path.join(SOURCES_DIR, file);
  const title = path.parse(file).name.slice(0, 255);
  const ext = path.extname(file).replace(".", "").toLowerCase();

  process.stdout.write(`\n• ${file} … `);
  const raw = await extractText(filePath);
  const chunks = chunkText(cleanText(raw));
  if (chunks.length === 0) {
    console.log("no text extracted, skipped");
    return 0;
  }
  process.stdout.write(`${chunks.length} chunks … embedding `);

  type Row = Database["public"]["Tables"]["veterinary_knowledge"]["Insert"];
  const rows: Row[] = [];

  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const slice = chunks.slice(i, i + EMBED_BATCH);
    const embeddings = await embedBatch(slice);
    slice.forEach((text, j) => {
      rows.push({
        text,
        embedding: toVector(embeddings[j]),
        metadata: { source_file: file, chunk_index: i + j },
        source: title,
        species: speciesFor(text),
        urgency_level: urgencyFor(text),
        body_system: bodySystemFor(text),
        breed_specific: breedSpecificFor(text),
      });
    });
    process.stdout.write(".");
  }

  process.stdout.write(" inserting ");
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase.from("veterinary_knowledge").insert(batch);
    if (error) {
      console.error(`\n  insert failed: ${error.message}`);
      throw error;
    }
    process.stdout.write(".");
  }

  await supabase.from("knowledge_processing_audit").insert({
    source_title: title,
    document_type: ext,
    total_chunks: rows.length,
    validation_status: "active",
  });

  console.log(` done (${rows.length} rows)`);
  return rows.length;
}

async function main(): Promise<void> {
  fs.mkdirSync(SOURCES_DIR, { recursive: true });
  const files = fs
    .readdirSync(SOURCES_DIR)
    .filter((f) => /\.(pdf|txt|md)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log(
      `No source files in ${SOURCES_DIR}.\n` +
        "Drop your veterinary PDFs / .txt files there and re-run.",
    );
    return;
  }

  console.log(`Ingesting ${files.length} file(s) from scripts/sources/`);
  let total = 0;
  for (const file of files) {
    total += await ingestFile(file);
  }
  console.log(`\n✓ Ingestion complete — ${total} chunks inserted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
