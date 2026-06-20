import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cosmetic, URL-safe slug of a pet name for /pets/[id]/[name]. The id is the
// authoritative key; this is only for readability, so an empty result is fine.
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

export function petHref(id: string, name: string): string {
  return `/pets/${id}/${petSlug(name)}`
}
