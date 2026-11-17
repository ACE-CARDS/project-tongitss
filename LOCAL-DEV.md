# Run the whole stack on your laptop (no server, no domain)

Goal: prove everything works on `http://localhost` before handing off to the hosting team.

## 0. Install (once)
- Docker Desktop (on Windows enable the WSL2 backend), Node 22 LTS, git
- MinIO client `mc` (https://min.io/docs/minio/linux/reference/minio-mc.html)
- On Windows run the `.sh` scripts from WSL or Git Bash

## 1. Put the package into your repo (branch `self-host`)
- Copy `Dockerfile` and `.dockerignore` to the repo root
- Copy the `deploy/` folder to the repo root
- Copy `code-templates/lib/*` to `lib/` and `code-templates/app/api/*` to `app/api/`
- Merge `next.config.snippet.js` into your `next.config.js`
- `npm i @supabase/postgrest-js jose`
- Replace the Supabase code in the 70 files (see the guide, Section 8), then `grep -rn supabase app components utils` should print nothing

## 2. Google login for localhost
Google Cloud Console, then Credentials, then OAuth client ID (Web). Authorized redirect URI:
`http://localhost:3000/api/auth/callback/google`

## 3. Secrets
```bash
cd deploy
cp .env.example .env
# make a secret (works on every OS):
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```
Run the command once per empty secret in `deploy/.env` (POSTGRES_PASSWORD, APP_OWNER_PASSWORD,
AUTHENTICATOR_PASSWORD, PGRST_JWT_SECRET, BETTER_AUTH_SECRET, MINIO_ROOT_PASSWORD, S3_SECRET_KEY)
and paste the Google client id/secret. Keep the localhost URL values as they are.

Then in the repo root: `cp deploy/env.local.example .env.local` and copy the same secret values in.

## 4. Get your data out of Supabase
You already have `public_schema.sql`. You also need the two user files. In the Supabase SQL Editor run each query and use
"Download CSV" on the result (save as `users.csv` and `accounts.csv` in a folder called `data/`):

```sql
select id, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email,'@',1)) as name,
       email, (email_confirmed_at is not null) as email_verified, raw_user_meta_data->>'avatar_url' as image,
       created_at, coalesce(updated_at, created_at) as updated_at
from auth.users where deleted_at is null;
```
```sql
select gen_random_uuid() as id, provider_id as account_id, provider as provider_id, user_id, created_at, created_at as updated_at
from auth.identities where provider = 'google';
```
Download the `member-photos` bucket into `export/member-photos/` (Storage dashboard), next to your existing `export/` folders.

## 5. Start the infrastructure
```bash
cd deploy
docker compose up -d postgres postgrest minio
docker compose ps          # all three "running"
```

## 6. Files
```bash
./scripts/minio-init.sh ../export
```
Expected counts: events 29, member-photos 59, news-image 56, execpics 10, resource-image 5.

## 7. Database
```bash
./scripts/restore.sh ../public_schema.sql ../data
```
Expected at the end: no tables without RLS, 92 policies, 25 ba.user rows.

## 8. Run the app
```bash
cd ..            # repo root
npm install
npm run dev      # http://localhost:3000
```
Sign in with a Google account that is in the `member` table. Then follow the smoke tests in Section 10 of the guide.

## Reset and retry
`cd deploy && docker compose down -v` deletes the database and file volumes. Then repeat from step 5.

## Common problems
| Symptom | Likely cause |
|---|---|
| `redirect_uri_mismatch` from Google | Redirect URI differs from `http://localhost:3000/api/auth/callback/google` |
| Login returns to an error page | Your Google email is not in `member.mem_email` (the whitelist trigger blocked it) |
| `permission denied for table ...` | Grants not applied (restore.sh step 7) or JWT secret differs between `.env` and `.env.local` |
| PostgREST returns 401 `JWSError` | `PGRST_JWT_SECRET` differs between `deploy/.env` and `.env.local` |
| Upload fails with `SignatureDoesNotMatch` | `S3_PUBLIC_ENDPOINT` not equal to the URL the browser uses (`http://localhost:9000`) |
| Upload blocked by CORS | `APP_ORIGIN` in `deploy/.env` is not `http://localhost:3000`; recreate minio |
| Port already in use | Something else uses 5432, 3001, 9000 or 9001; stop it or change the published port |
