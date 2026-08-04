import { Cat, Dog } from "lucide-react";

import { cn } from "@/lib/utils";

// One place that decides "photo or species icon" so every surface (pet card,
// pet record header, dashboard list) stays consistent. The photo is always a
// circle; without one we keep the existing squircle icon tile.
export function PetAvatar({
  species,
  name,
  photoUrl,
  className,
  iconClassName,
}: {
  species: string;
  name: string;
  photoUrl?: string | null;
  /** Sizing/shape of the tile, e.g. "size-10 rounded-2xl". */
  className?: string;
  iconClassName?: string;
}) {
  if (photoUrl) {
    // Signed Storage URLs are short-lived and per-request, so next/image
    // optimisation would only cache a URL that expires.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`${name}'s photo`}
        className={cn(
          "size-10 shrink-0 rounded-full object-cover ring-1 ring-outline-variant/30",
          className,
          "rounded-full",
        )}
      />
    );
  }

  const Icon = species === "Cat" ? Cat : Dog;
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand",
        className,
      )}
    >
      <Icon className={cn("size-5", iconClassName)} aria-hidden />
    </span>
  );
}
