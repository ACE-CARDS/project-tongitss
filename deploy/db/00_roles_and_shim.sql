-- Run as the postgres superuser. restore.sh passes the two passwords as psql variables:
--   psql -v authenticator_password=... -v app_owner_password=... -f 00_roles_and_shim.sql

-- Roles PostgREST and the existing RLS policies expect
CREATE ROLE anon NOLOGIN NOINHERIT;
CREATE ROLE authenticated NOLOGIN NOINHERIT;
CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
CREATE ROLE authenticator LOGIN NOINHERIT NOCREATEDB NOCREATEROLE PASSWORD '9b7e2d07f672b5d0eba0d6b4e74f10d77b4bb5184b820508';
GRANT anon, authenticated, service_role TO authenticator;

-- Role used by Next.js for Better Auth only; owns only schema "ba"
CREATE ROLE app_owner LOGIN PASSWORD 'e25e53c596792312d2b2b708f75f37bf42c2a7dbe5341202';
CREATE SCHEMA ba AUTHORIZATION app_owner;
ALTER ROLE app_owner SET search_path = ba;

-- Re-create the helper functions Supabase policies call
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claim', true), ''),
                  nullif(current_setting('request.jwt.claims', true), ''))::jsonb
$$;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(auth.jwt() ->> 'sub', '')::uuid
$$;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT nullif(auth.jwt() ->> 'role', '')::text
$$;

CREATE OR REPLACE FUNCTION auth.email() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT nullif(auth.jwt() ->> 'email', '')::text
$$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
