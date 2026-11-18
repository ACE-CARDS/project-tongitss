#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<SQL
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role authenticator login noinherit password '${AUTHENTICATOR_PASSWORD}';
grant anon, authenticated to authenticator;
create role app_auth login password '${APP_AUTH_PASSWORD}';
create schema if not exists extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pgcrypto with schema extensions;
alter database app set search_path = public, extensions;
SQL