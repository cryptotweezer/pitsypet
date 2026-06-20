import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

// Shared embedding helper. Imported by BOTH the ingestion script
// (scripts/ingest.ts) and the Phase 5 runtime RAG path, so the query and the
// stored chunks are embedded by the exact same model — no train/serve skew.
const model = openai.embedding("text-embedding-3-small");

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model, value: text });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model, values: texts });
  return embeddings;
}

// Build the retrieval query as a natural-language sentence so the query
// distribution matches the prose chunks in the knowledge base.
export function buildRagQuery(
  species: string,
  breed: string,
  symptomNames: string[],
): string {
  const symptoms = symptomNames.join(", ");
  return `A ${breed} ${species.toLowerCase()} presents with ${symptoms}. Assess the likely causes and clinical urgency.`;
}
