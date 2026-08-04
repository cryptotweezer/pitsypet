import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  PET_PHOTO_BUCKET,
  PET_PHOTO_MAX_BYTES,
  PET_PHOTO_MIME_TYPES,
  extensionForMime,
  petPhotoPath,
  signPetPhoto,
} from "@/lib/pet-photo";

// POST = upload/replace the pet's profile photo. DELETE = remove it.
//
// The file lives in the PRIVATE `pet-photos` bucket under the owner's uid; the
// cookie-scoped client means Storage RLS authorises the write with the same
// session that RLS uses for the pets row. Only the object path is stored on the
// row — reads are signed per request.

type Params = { params: Promise<{ id: string }> };

async function ownedPet(petId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, pet: null };

  const { data: pet } = await supabase
    .from("pets")
    .select("pet_id, photo_path")
    .eq("pet_id", petId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  return { supabase, user, pet };
}

export async function POST(request: NextRequest, props: Params) {
  const { id } = await props.params;
  const { supabase, user, pet } = await ownedPet(id);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (file.size > PET_PHOTO_MAX_BYTES) {
    return NextResponse.json(
      { error: "That image is too large (2 MB max)." },
      { status: 413 },
    );
  }
  if (!PET_PHOTO_MIME_TYPES.includes(file.type as (typeof PET_PHOTO_MIME_TYPES)[number])) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WebP images are supported." },
      { status: 415 },
    );
  }

  // New object per upload (never overwrite in place) so a stale signed URL or a
  // CDN cache can't serve the previous pet's picture under the same key.
  const path = petPhotoPath(user.id, pet.pet_id, extensionForMime(file.type));
  const { error: uploadError } = await supabase.storage
    .from(PET_PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("pets")
    .update({ photo_path: path })
    .eq("pet_id", pet.pet_id)
    .eq("user_id", user.id);

  if (updateError) {
    // Don't leave an orphan object behind if the row write failed.
    await supabase.storage.from(PET_PHOTO_BUCKET).remove([path]);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  if (pet.photo_path && pet.photo_path !== path) {
    await supabase.storage.from(PET_PHOTO_BUCKET).remove([pet.photo_path]);
  }

  const photo_url = await signPetPhoto(supabase, path);
  return NextResponse.json({ photo_path: path, photo_url });
}

export async function DELETE(_request: NextRequest, props: Params) {
  const { id } = await props.params;
  const { supabase, user, pet } = await ownedPet(id);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("pets")
    .update({ photo_path: null })
    .eq("pet_id", pet.pet_id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to remove photo" }, { status: 500 });
  }

  if (pet.photo_path) {
    await supabase.storage.from(PET_PHOTO_BUCKET).remove([pet.photo_path]);
  }

  return NextResponse.json({ ok: true });
}
