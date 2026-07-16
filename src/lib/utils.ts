import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL-safe slug of a pet name. Stored slugs (pets.slug, assigned via
// src/lib/pet-slug.ts) are built from this same normalisation.
export function petSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "pet"
  )
}

// Pet pages are addressed by the STORED slug (unique per user), not the id.
export function petHref(slug: string): string {
  return `/pets/${slug}`
}

// AI-generated prose (chat replies, recommended_action, clinical_reasoning, …)
// is rendered as plain text: strip inline markdown markers and normalise the
// em/en dashes models love, so the user never sees raw **, backticks, or "—".
export function cleanAiText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url) → text
    .replace(/(\*\*|__)(.+?)\1/g, "$2") // **bold** / __bold__
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=[\s.,;:!?)]|$)/g, "$1$2") // *em* / _em_
    .replace(/`([^`]*)`/g, "$1") // `code`
    .replace(/^#{1,6}\s+/gm, "") // # headings
    .replace(/\s+[—–]\s+/g, ", ") // spaced em/en dash → comma
    .replace(/[—–]/g, "-") // any leftover dash → hyphen
}
