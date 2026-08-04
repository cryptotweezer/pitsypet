import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export const PET_PHOTO_BUCKET = "pet-photos";

/** Max upload size accepted by the API (matches the bucket's file_size_limit). */
export const PET_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export const PET_PHOTO_MIME_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

/** Signed URLs are short-lived; pages are server-rendered per request anyway. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

type Client = SupabaseClient<Database>;

/**
 * Sign a batch of pet photo paths in one call.
 * Returns a path → URL map; paths that fail to sign are simply absent, so the
 * caller falls back to the species icon instead of rendering a broken image.
 */
export async function signPetPhotos(
  supabase: Client,
  paths: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const unique = Array.from(
    new Set(paths.filter((p): p is string => typeof p === "string" && p !== "")),
  );
  const urls = new Map<string, string>();
  if (unique.length === 0) return urls;

  const { data, error } = await supabase.storage
    .from(PET_PHOTO_BUCKET)
    .createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return urls;

  for (const row of data) {
    if (row.signedUrl && row.path) urls.set(row.path, row.signedUrl);
  }
  return urls;
}

/** Single-path convenience wrapper around {@link signPetPhotos}. */
export async function signPetPhoto(
  supabase: Client,
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  const urls = await signPetPhotos(supabase, [path]);
  return urls.get(path) ?? null;
}

/** Storage key for a new upload. The first segment MUST be the owner's uid — the
 *  Storage RLS policies authorise on exactly that folder name. */
export function petPhotoPath(
  userId: string,
  petId: string,
  extension: string,
): string {
  return `${userId}/${petId}-${Date.now()}.${extension}`;
}

export function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return "webp";
}
