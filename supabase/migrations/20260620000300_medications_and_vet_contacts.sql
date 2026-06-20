-- Phase 7.5 Part 1: per-pet clinical records. Both carry user_id (like
-- assessments) so RLS is a simple auth.uid() = user_id check, and pet_id with
-- ON DELETE CASCADE so a permanent pet delete cleans these up too.

CREATE TABLE medications (
  medication_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  dosage        VARCHAR(100),
  quantity      VARCHAR(100),
  frequency     VARCHAR(100),
  notes         TEXT,
  prescribed_by VARCHAR(200),
  started_at    DATE,
  ended_at      DATE,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE TABLE vet_contacts (
  vet_contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id         UUID NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name    VARCHAR(200),
  clinic_name    VARCHAR(200),
  phone          VARCHAR(50),
  email          VARCHAR(255),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

CREATE INDEX idx_medications_pet  ON medications(pet_id)  WHERE deleted_at IS NULL;
CREATE INDEX idx_vet_contacts_pet ON vet_contacts(pet_id) WHERE deleted_at IS NULL;

-- updated_at maintenance (reuses the shared trigger function).
CREATE TRIGGER set_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_vet_contacts_updated_at
  BEFORE UPDATE ON vet_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: owner-only, mirroring pets/assessments.
ALTER TABLE medications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own medications" ON medications
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own vet contacts" ON vet_contacts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
