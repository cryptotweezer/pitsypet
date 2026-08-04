// Client-only image preparation for pet profile photos.
//
// The avatar is always displayed as a small circle, so we centre-crop to a
// square and downscale before uploading: it keeps the stored object well under
// the bucket's 2 MB limit and avoids shipping 8 MP phone photos over the wire.

export const PET_PHOTO_SIZE = 512;

/** Formats we accept from the file picker (before re-encoding). */
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

/** Guard against a decode bomb: reject huge originals before touching a canvas. */
export const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
}

/**
 * Centre-crop `file` to a square and re-encode it at {@link PET_PHOTO_SIZE}px.
 * Prefers WebP and falls back to JPEG if the browser cannot encode it.
 */
export async function toSquareImage(file: File): Promise<File> {
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error("That image is too large. Please choose one under 15 MB.");
  }

  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  if (side === 0) throw new Error("Could not read that image.");

  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  // Never upscale a small original.
  const target = Math.min(PET_PHOTO_SIZE, side);

  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);

  let type = "image/webp";
  let blob = await toBlob(canvas, type);
  if (!blob || blob.type !== type) {
    type = "image/jpeg";
    blob = await toBlob(canvas, type);
  }
  if (!blob) throw new Error("Could not process that image.");

  const ext = type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `pet-photo.${ext}`, { type });
}
