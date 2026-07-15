-- Human-readable pet URLs: /pets/max instead of /pets/<uuid>/max.
-- Adds pets.slug, generated from pet_name (lowercase, accent-stripped,
-- hyphenated), unique PER USER among ACTIVE pets (partial index, mirroring
-- idx_pets_user_name_active). "new" is reserved (collides with /pets/new).
-- The app assigns slugs on create/rename (see src/lib/pet-slug.ts); this
-- migration backfills existing rows with the same rules.

ALTER TABLE public.pets ADD COLUMN slug TEXT;

WITH base AS (
  SELECT
    pet_id,
    user_id,
    deleted_at,
    COALESCE(
      NULLIF(
        BTRIM(
          REGEXP_REPLACE(
            TRANSLATE(
              LOWER(pet_name),
              'áàâäãéèêëíìîïóòôöõúùûüñç',
              'aaaaaeeeeiiiiooooouuuunc'
            ),
            '[^a-z0-9]+', '-', 'g'
          ),
          '-'
        ),
        ''
      ),
      'pet'
    ) AS s
  FROM public.pets
),
reserved AS (
  SELECT pet_id, user_id, deleted_at,
    CASE WHEN s = 'new' THEN 'new-pet' ELSE s END AS s
  FROM base
),
numbered AS (
  -- Dedupe across ALL of a user's pets (soft-deleted included) so a restore
  -- can't collide. Active pets win the bare slug.
  SELECT pet_id, s,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, s
      ORDER BY (deleted_at IS NOT NULL), pet_id
    ) AS rn
  FROM reserved
)
UPDATE public.pets p
SET slug = CASE WHEN n.rn = 1 THEN n.s ELSE n.s || '-' || n.rn::text END
FROM numbered n
WHERE n.pet_id = p.pet_id;

ALTER TABLE public.pets ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pets_user_slug_active
  ON public.pets (user_id, slug)
  WHERE deleted_at IS NULL;
