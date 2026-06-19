CREATE TABLE pets (
  pet_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_name           VARCHAR(50) NOT NULL,
  species            VARCHAR(10) NOT NULL CHECK (species IN ('Dog', 'Cat')),
  breed              VARCHAR(100) NOT NULL,
  age_years          INTEGER NOT NULL CHECK (age_years >= 0 AND age_years <= 25),
  age_months         INTEGER CHECK (age_months >= 0 AND age_months <= 11),
  weight_kg          DECIMAL(5,2) NOT NULL,
  medical_conditions JSONB NOT NULL DEFAULT '[]',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ,
  UNIQUE(user_id, pet_name)
);
