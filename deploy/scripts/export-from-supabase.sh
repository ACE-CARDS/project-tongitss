#!/usr/bin/env bash
# Run by whoever has Supabase access (needs Docker). Produces the handoff files.
# Usage:
#   SRC='postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres' \
#     ./export-from-supabase.sh [outdir]
# Use the "Session pooler" connection string from Supabase (Connect button); the direct
# db.<ref>.supabase.co host is IPv6-only on some plans and may not work from Docker.
set -euo pipefail
: "${SRC:?Set SRC to the Supabase connection string}"
OUT="${1:-handoff}"
mkdir -p "$OUT"
PG=(docker run --rm -i postgres:17)

echo "Dumping public schema + data..."
"${PG[@]}" pg_dump "$SRC" --schema=public --no-owner --no-privileges > "$OUT/public_schema.sql"

echo "Exporting users and Google identities..."
"${PG[@]}" psql "$SRC" -c "\copy (select id, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email,'@',1)) as name, email, (email_confirmed_at is not null) as email_verified, raw_user_meta_data->>'avatar_url' as image, created_at, coalesce(updated_at, created_at) as updated_at from auth.users where deleted_at is null) to stdout csv header" > "$OUT/users.csv"
"${PG[@]}" psql "$SRC" -c "\copy (select gen_random_uuid() as id, provider_id as account_id, provider as provider_id, user_id, created_at, created_at as updated_at from auth.identities where provider='google') to stdout csv header" > "$OUT/accounts.csv"

echo "Done. Files in $OUT/ :"
ls -l "$OUT"
echo "Storage buckets are NOT included. Download them from Supabase (Storage dashboard)"
echo "or mirror them with mc using the S3 connection details (see guide, section 9.2)."
