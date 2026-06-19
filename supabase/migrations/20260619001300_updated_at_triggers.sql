-- Keep updated_at in sync automatically on every UPDATE.
-- Without this, updated_at stays equal to created_at forever (it only had a
-- DEFAULT NOW() on insert), which would make pet edits and any future
-- "last changed" sorting/display in later phases incorrect.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
