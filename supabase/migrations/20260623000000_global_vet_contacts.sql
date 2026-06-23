-- Phase 7.5 (Group D follow-up): vet clinics + doctors become OWNER-level, not
-- pet-level. A clinic/doctor the owner records is available to ALL their pets
-- (and to the assistant in every chat + assessment), instead of being re-entered
-- per pet. Appointments stay per-pet (each appointment has a pet_id) but link to
-- these now-global clinics.
--
-- RLS on both tables is already `auth.uid() = user_id`, so dropping pet_id needs
-- no policy change. The existing test rows were removed by the owner before this
-- migration, so there is nothing to migrate/dedup — we just drop the columns.
-- (The pet_id partial indexes are dropped automatically with their column.)

ALTER TABLE vet_contacts DROP COLUMN pet_id;
ALTER TABLE vet_doctors  DROP COLUMN pet_id;

-- List clinics (and a pet's doctors) by owner now that pet_id is gone.
CREATE INDEX idx_vet_contacts_user ON vet_contacts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vet_doctors_user  ON vet_doctors(user_id)  WHERE deleted_at IS NULL;
