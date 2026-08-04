"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PetAvatar } from "@/components/pets/pet-avatar";
import { ACCEPTED_IMAGE_TYPES, toSquareImage } from "@/lib/image/square-crop";

// Photo picker for the pet form. Presentational: it hands the parent a
// centre-cropped, downscaled File and lets the parent decide when to upload
// (on create we only have a pet id AFTER the row is inserted).
export function PetPhotoField({
  species,
  name,
  previewUrl,
  onSelect,
  onRemove,
  disabled,
}: {
  species: string;
  name: string;
  previewUrl: string | null;
  onSelect: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setWorking(true);
    try {
      const square = await toSquareImage(file);
      onSelect(square, URL.createObjectURL(square));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that image.");
    } finally {
      setWorking(false);
      // Allow re-picking the same file straight after a failure.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">Photo (optional)</span>
      <div className="flex items-center gap-4">
        <PetAvatar
          species={species}
          name={name || "your pet"}
          photoUrl={previewUrl}
          className="size-20"
          iconClassName="size-9"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || working}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" aria-hidden />
            {working ? "Preparing…" : previewUrl ? "Change photo" : "Upload photo"}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              disabled={disabled || working}
              onClick={() => {
                setError(null);
                onRemove();
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">JPEG, PNG, or WebP.</p>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
