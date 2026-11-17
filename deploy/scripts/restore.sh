#!/usr/bin/env bash
# Rebuilds the database from a Supabase export. Run from anywhere; needs Docker.
# Usage: ./restore.sh <public_schema.sql> <dir containing users.csv and accounts.csv>
# Prerequisites: deploy/.env filled in, and the Better Auth config in the repo
# (lib/auth.ts) so the migration step can create the ba.* tables.
set -euo pipefail
DUMP="$(realpath "${1:?path to public_schema.sql}")"
DATA="$(realpath "${2:?dir with users.csv and accounts.csv}")"
cd "$(dirname "$0")/.."                      # deploy/
REPO="$(cd .. && pwd)"
set -a; . ./.env; set +a
: "${SUPABASE_PROJECT_REF:?set in .env}" "${FILES_BASE_URL:?set in .env}"
[ -f "$DATA/users.csv" ] && [ -f "$DATA/accounts.csv" ] || { echo "users.csv / accounts.csv missing in $DATA"; exit 1; }

PSQL=(docker compose exec -T postgres psql -U postgres -d tongitss -v ON_ERROR_STOP=1 -q)

echo "[1/8] Starting postgres..."
docker compose up -d postgres
until docker compose exec -T postgres pg_isready -U postgres -d tongitss >/dev/null 2>&1; do sleep 2; done

echo "[2/8] Roles and auth.* helper functions..."
if [ "$("${PSQL[@]}" -tAc "select 1 from pg_roles where rolname='anon'")" != "1" ]; then
  "${PSQL[@]}" -v authenticator_password="$AUTHENTICATOR_PASSWORD" -v app_owner_password="$APP_OWNER_PASSWORD" < db/00_roles_and_shim.sql
else
  echo "    already done, skipping"
fi

echo "[3/8] Better Auth tables (ba.*)..."
export AUTH_DATABASE_URL="postgres://app_owner:${APP_OWNER_PASSWORD}@127.0.0.1:5432/tongitss"
CONFIG="${AUTH_CONFIG:-lib/auth.ts}"
if command -v npx >/dev/null 2>&1; then
  (cd "$REPO" && npx --yes @better-auth/cli@latest migrate --config "$CONFIG" -y)
else
  docker run --rm --network host -e AUTH_DATABASE_URL -e BETTER_AUTH_SECRET -e GOOGLE_CLIENT_ID -e GOOGLE_CLIENT_SECRET \
    -v "$REPO":/app -w /app node:22 sh -c "npm ci && npx --yes @better-auth/cli@latest migrate --config $CONFIG -y"
fi
TYPE="$("${PSQL[@]}" -tAc "select data_type from information_schema.columns where table_schema='ba' and table_name='user' and column_name='id'")"
if [ "$TYPE" != "uuid" ]; then
  echo "ERROR: ba.user.id is '$TYPE', expected uuid. See guide section 5.1 before continuing."; exit 1
fi

echo "[4/8] Importing users and Google accounts..."
if [ "$("${PSQL[@]}" -tAc 'select count(*) from ba."user"')" = "0" ]; then
  "${PSQL[@]}" -c '\copy ba."user"(id,name,email,"emailVerified",image,"createdAt","updatedAt") from stdin csv header' < "$DATA/users.csv"
  "${PSQL[@]}" -c '\copy ba.account(id,"accountId","providerId","userId","createdAt","updatedAt") from stdin csv header' < "$DATA/accounts.csv"
else
  echo "    ba.user already has rows, skipping"
fi

echo "[5/8] Preparing the dump (URL rewrite, schema fixes)..."
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
OLD="https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object"
sed -E \
  -e '/^\\(un)?restrict /d' \
  -e '/^CREATE SCHEMA public;$/d' \
  -e '/^COMMENT ON SCHEMA public /d' \
  -e 's/REFERENCES auth\.users\(id\)/REFERENCES ba."user"(id)/g' \
  -e "s#${OLD}/public/#${FILES_BASE_URL}/#g" \
  -e "s#${OLD}/sign/([^/]+)/([^?[:space:]]+)\?token=[A-Za-z0-9._-]+#${FILES_BASE_URL}/\1/\2#g" \
  "$DUMP" > "$TMP"
LEFT="$(grep -c 'supabase\.co' "$TMP" || true)"
[ "$LEFT" = "0" ] || echo "    WARNING: $LEFT lines still mention supabase.co - inspect them"

echo "[6/8] Restoring schema and data..."
"${PSQL[@]}" < "$TMP"

echo "[7/8] Grants and login triggers..."
"${PSQL[@]}" < db/03_grants.sql
"${PSQL[@]}" < db/04_triggers.sql

echo "[8/8] Checks..."
echo "Tables without RLS (expect none):"
"${PSQL[@]}" -tAc "select tablename from pg_tables where schemaname='public' and not rowsecurity"
echo "Policies (expect 92):  $("${PSQL[@]}" -tAc "select count(*) from pg_policies where schemaname='public'")"
echo "ba.user rows:          $("${PSQL[@]}" -tAc 'select count(*) from ba."user"')"
echo "public.users rows:     $("${PSQL[@]}" -tAc 'select count(*) from public.users')"
echo "Done."
