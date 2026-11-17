# Deployment runbook (hosting team)

You need: a Linux server with Docker + Compose, two DNS names (app and files), ports 80/443 open,
and from the developer: this repo, `deploy/.env` values, `public_schema.sql`, `users.csv`, `accounts.csv`, and the `export/` folder of bucket files.

1. Server prep (OS update, firewall allow 22/80/443, install Docker, `mc`): see the guide, Section 2 steps 2 to 6.
2. Put the repo at `/opt/tongitss/app`. Copy `.env.example` to `deploy/.env` and fill every value with production values:
   `APP_ORIGIN=https://app.example.com`, `FILES_BASE_URL=https://files.example.com`, `APP_DOMAIN`, `FILES_DOMAIN`.
   Secrets must be hex (no `/ + =`). `chmod 600 deploy/.env`.
3. Google OAuth redirect URI: `https://<APP_DOMAIN>/api/auth/callback/google`.
4. Infrastructure: `cd deploy && docker compose up -d postgres postgrest minio`
5. Files: `./scripts/minio-init.sh <path-to>/export`
6. Database: `./scripts/restore.sh <path-to>/public_schema.sql <path-to>/data`
7. Application: `docker compose --profile prod up -d --build`
8. Smoke tests: guide, Section 10. Backups and security checklist: guide, Section 11.

Re-running: `restore.sh` skips completed steps for roles and users, but the dump restore is not repeatable on a database that already has data.
To start over: `docker compose down -v` (deletes ALL data).
