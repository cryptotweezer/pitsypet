-- Pet profile photos.
--
-- The image itself lives in a PRIVATE Storage bucket; the pets row only keeps
-- the object path. Reads go through short-lived signed URLs generated server
-- side, so a photo is never reachable without an authenticated session.
--
-- Object paths are always "<user_id>/<pet_id>-<timestamp>.<ext>" — the first
-- folder segment is the owner's uid, which is exactly what the policies below
-- check, so one user can never read or write another user's photos.

ALTER TABLE pets ADD COLUMN IF NOT EXISTS photo_path TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  FALSE,
  2097152, -- 2 MB; the client downscales to 512px before uploading
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "pet photos: owner read" ON storage.objects;
CREATE POLICY "pet photos: owner read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "pet photos: owner insert" ON storage.objects;
CREATE POLICY "pet photos: owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "pet photos: owner update" ON storage.objects;
CREATE POLICY "pet photos: owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "pet photos: owner delete" ON storage.objects;
CREATE POLICY "pet photos: owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
