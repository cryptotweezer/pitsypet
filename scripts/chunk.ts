import { getEncoding } from "js-tiktoken";

// cl100k_base is the tokenizer used by text-embedding-3-small, so chunk
// boundaries here match how the embedding model counts tokens.
const enc = getEncoding("cl100k_base");

export interface ChunkOptions {
  /** Target tokens per chunk. */
  chunkSize?: number;
  /** Tokens of overlap carried between consecutive chunks. */
  overlap?: number;
}

// Collapse the messy whitespace that PDF text extraction leaves behind
// (form-feeds, repeated blank lines, hyphen line-breaks) without destroying
// paragraph structure.
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/-\n(?=\w)/g, "") // join words split across a line break
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim();
}

// Split text into ~chunkSize-token windows with ~overlap-token overlap.
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { chunkSize = 400, overlap = 50 } = options;
  const step = Math.max(1, chunkSize - overlap);

  const tokens = enc.encode(text);
  if (tokens.length === 0) return [];

  const chunks: string[] = [];
  for (let start = 0; start < tokens.length; start += step) {
    const end = Math.min(start + chunkSize, tokens.length);
    const piece = enc.decode(tokens.slice(start, end)).trim();
    if (piece.length > 0) chunks.push(piece);
    if (end === tokens.length) break;
  }
  return chunks;
}
