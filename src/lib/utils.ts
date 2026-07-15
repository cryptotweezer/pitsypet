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
