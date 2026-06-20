-- Soft delete collided with UNIQUE(user_id, pet_name): a soft-deleted pet kept
-- its name and blocked re-creating a pet with the same name ("A pet with this
-- name already exists"). Replace the full unique constraint with a PARTIAL
-- unique index that only enforces uniqueness among non-deleted pets.
-- A unique-index violation still raises pg code 23505, so the API's 409 path
-- (active duplicate names) is unchanged.

DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.pets'::regclass AND contype = 'u';
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.pets DROP CONSTRAINT %I', cname);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pets_user_name_active
  ON public.pets (user_id, pet_name)
  WHERE deleted_at IS NULL;
