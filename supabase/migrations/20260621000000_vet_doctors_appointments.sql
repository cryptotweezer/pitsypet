-- Phase 7.5 Part 2 (Group B): richer vet records + appointments.
-- vet_contacts now represents a CLINIC (one clinic can have several doctors who
-- treat the pet). Doctors move to their own table; structured service hours and
-- an address live on the clinic. Next appointments get their own table.

-- 1) Clinic gains structured service hours (array of {day,open,close}) so the UI
--    can offer click-to-pick days/times instead of stuffing it into notes.
ALTER TABLE vet_contacts ADD COLUMN service_hours JSONB NOT NULL DEFAULT '[]';
ALTER TABLE vet_contacts ADD COLUMN address TEXT;

-- 2) Doctors belonging to a clinic (one clinic → many doctors).
CREATE TABLE vet_doctors (
  doctor_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vet_contact_id UUID NOT NULL REFERENCES vet_contacts(vet_contact_id) ON DELETE CASCADE,
  pet_id         UUID NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           VARCHAR(200) NOT NULL,
  specialty      VARCHAR(200),
  phone          VARCHAR(50),
  email          VARCHAR(255),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

-- 3) Migrate any existing doctor_name into the new doctors table, then drop it.
INSERT INTO vet_doctors (vet_contact_id, pet_id, user_id, name)
SELECT vet_contact_id, pet_id, user_id, btrim(doctor_name)
FROM vet_contacts
WHERE doctor_name IS NOT NULL AND btrim(doctor_name) <> '';

ALTER TABLE vet_contacts DROP COLUMN doctor_name;

-- 4) Appointments (next visits). Optionally linked to a clinic; if the clinic is
--    deleted the appointment survives with a null link.
CREATE TABLE appointments (
  appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vet_contact_id UUID REFERENCES vet_contacts(vet_contact_id) ON DELETE SET NULL,
  title          VARCHAR(200) NOT NULL,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  reason         TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

CREATE INDEX idx_vet_doctors_clinic ON vet_doctors(vet_contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vet_doctors_pet    ON vet_doctors(pet_id)         WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_pet   ON appointments(pet_id)        WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_when  ON appointments(scheduled_at)  WHERE deleted_at IS NULL;

-- updated_at maintenance (reuses the shared trigger function).
CREATE TRIGGER set_vet_doctors_updated_at
  BEFORE UPDATE ON vet_doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: owner-only, mirroring medications/vet_contacts.
ALTER TABLE vet_doctors  ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vet doctors" ON vet_doctors
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own appointments" ON appointments
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
