-- Allow an authenticated user to permanently delete only their own account.
-- The function is SECURITY DEFINER because auth.users is not exposed through
-- the Data API. It accepts no user id, derives the caller from auth.uid(), and
-- requires an explicit confirmation value as an additional safety guard.
CREATE OR REPLACE FUNCTION public.delete_own_account(confirmation_text TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_id UUID := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  IF confirmation_text IS DISTINCT FROM 'DELETE' THEN
    RAISE EXCEPTION 'Invalid account deletion confirmation'
      USING ERRCODE = '22023';
  END IF;

  DELETE FROM auth.users
  WHERE id = caller_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_own_account(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account(TEXT) TO authenticated;

COMMENT ON FUNCTION public.delete_own_account(TEXT) IS
  'Permanently deletes the authenticated user after exact DELETE confirmation.';
