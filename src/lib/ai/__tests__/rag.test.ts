import { describe, it, expect } from "vitest";

import { rankChunks, type KnowledgeChunk } from "../rag";

function chunk(
  id: string,
  similarity: number,
  source: string,
  urgency_level = 5,
): KnowledgeChunk {
  return {
    chunk_id: id,
    text: `chunk ${id}`,
    source,
    species: "Dog",
    urgency_level,
    body_system: null,
    breed_specific: false,
    similarity,
  };
}

describe("rankChunks — filter / re-rank / diversify", () => {
  it("drops chunks below the 0.3 similarity floor", () => {
    const out = rankChunks([
      chunk("a", 0.29, "s1"),
      chunk("b", 0.31, "s2"),
    ]);
    expect(out.map((c) => c.chunk_id)).toEqual(["b"]);
  });

  it("lets urgency NUDGE order but never hide a chunk", () => {
    // Lower similarity but max urgency should rank first via the +0.05 nudge…
    const out = rankChunks([
      chunk("low-urg", 0.5, "s1", 1), // score 0.505
      chunk("high-urg", 0.49, "s2", 10), // score 0.54
    ]);
    expect(out.map((c) => c.chunk_id)).toEqual(["high-urg", "low-urg"]);
    // …and the low-urgency chunk is still present, just ordered after.
    expect(out).toHaveLength(2);
  });

  it("keeps at most 2 chunks per source", () => {
    const out = rankChunks([
      chunk("a", 0.9, "same"),
      chunk("b", 0.8, "same"),
      chunk("c", 0.7, "same"), // 3rd from "same" → dropped
      chunk("d", 0.6, "other"),
    ]);
    expect(out.map((c) => c.chunk_id)).toEqual(["a", "b", "d"]);
  });

  it("returns at most the top 5", () => {
    const rows = Array.from({ length: 8 }, (_, i) =>
      chunk(`c${i}`, 0.9 - i * 0.01, `src${i}`),
    );
    expect(rankChunks(rows)).toHaveLength(5);
  });

  it("returns [] for no rows", () => {
    expect(rankChunks([])).toEqual([]);
  });
});
