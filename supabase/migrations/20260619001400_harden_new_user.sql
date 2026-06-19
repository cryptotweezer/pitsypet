-- Make the signup -> profile trigger idempotent. If a profiles row for the new
-- auth user already exists (re-fired trigger, manual backfill, race), a plain
-- INSERT would raise a duplicate-key error and roll back the whole signup
-- transaction, blocking registration. ON CONFLICT makes it safe to re-run.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, state)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'state')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
