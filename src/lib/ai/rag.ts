import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { embedText, buildRagQuery } from "./embed";

export interface KnowledgeChunk {
  chunk_id: string;
  text: string;
  source: string;
  species: string;
  urgency_level: number;
  body_system: string | null;
  breed_specific: boolean;
  similarity: number;
}

const MIN_SIMILARITY = 0.3;
const MAX_PER_SOURCE = 2;
const TOP_K = 5;

// Tier 2. Embed a natural-language query, vector-search the knowledge base,
// then quality-filter, re-rank, and diversify in TypeScript. Urgency is a
// re-rank nudge only — it NEVER hides a chunk. Any failure returns [] so
// classification can proceed without RAG context.
export async function retrieveKnowledge(
  supabase: SupabaseClient<Database>,
  symptomNames: string[],
  species: string,
  breed: string,
): Promise<KnowledgeChunk[]> {
  if (symptomNames.length === 0) return [];

  try {
    const query = buildRagQuery(species, breed, symptomNames);
    const embedding = await embedText(query);

    const { data, error } = await supabase.rpc("search_veterinary_knowledge", {
      query_embedding: `[${embedding.join(",")}]`,
      match_species: species,
      match_count: 12,
    });
    if (error || !data) return [];

    const rows = data as KnowledgeChunk[];

    // Quality filter, then re-rank: similarity + a small urgency nudge.
    const ranked = rows
      .filter((c) => c.similarity >= MIN_SIMILARITY)
      .map((c) => ({ chunk: c, score: c.similarity + 0.05 * (c.urgency_level / 10) }))
      .sort((a, b) => b.score - a.score);

    // Source diversity: at most MAX_PER_SOURCE per source, take the top TOP_K.
    const perSource = new Map<string, number>();
    const selected: KnowledgeChunk[] = [];
    for (const { chunk } of ranked) {
      const used = perSource.get(chunk.source) ?? 0;
      if (used >= MAX_PER_SOURCE) continue;
      perSource.set(chunk.source, used + 1);
      selected.push(chunk);
      if (selected.length >= TOP_K) break;
    }
    return selected;
  } catch {
    return [];
  }
}
