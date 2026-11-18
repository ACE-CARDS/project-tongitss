-- 1. Drop the old Supabase auth.users foreign key so Better Auth users can insert into public.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 2. Adapt create_user_on_login() for Better Auth (text -> uuid cast + BIGINT member_id)
CREATE OR REPLACE FUNCTION public.create_user_on_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  found_member_id BIGINT;
BEGIN
  SELECT id INTO found_member_id
  FROM public.member
  WHERE lower(mem_email) = lower(NEW.email)
  LIMIT 1;

  INSERT INTO public.users (id, member_id)
  VALUES (NEW.id::uuid, found_member_id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 3. Attach whitelist check and user-linking triggers to Better Auth's auth.users table
DROP TRIGGER IF EXISTS on_auth_user_whitelist ON auth.users;
CREATE TRIGGER on_auth_user_whitelist
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_member_whitelist();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_on_login();