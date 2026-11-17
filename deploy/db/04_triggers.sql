-- Recreates the two login triggers that used to sit on auth.users in Supabase.
-- Run ONLY after the users import and the data restore, otherwise the whitelist
-- trigger fires while the existing users are being imported.
-- Verify the original definitions first on Supabase:
--   select tgname, pg_get_triggerdef(oid) from pg_trigger
--   where tgrelid = 'auth.users'::regclass and not tgisinternal;
CREATE TRIGGER check_member_whitelist BEFORE INSERT ON ba."user"
  FOR EACH ROW EXECUTE FUNCTION public.check_member_whitelist();

CREATE TRIGGER create_user_on_login AFTER INSERT ON ba."user"
  FOR EACH ROW EXECUTE FUNCTION public.create_user_on_login();
