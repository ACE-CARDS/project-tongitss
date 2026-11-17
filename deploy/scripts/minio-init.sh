#!/usr/bin/env bash
# Creates the buckets, makes them public-read, creates the app user, and optionally
# uploads existing files.
# Usage: ./minio-init.sh [path-to-export-dir]   (export dir holds one folder per bucket)
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
command -v mc >/dev/null || { echo "Install the MinIO client 'mc' first"; exit 1; }
EXPORT_DIR="${1:-}"
BUCKETS="news-image events resource-image execpics member-photos"

mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

for b in $BUCKETS; do
  mc mb --ignore-existing "local/$b"
  mc anonymous set download "local/$b"       # public read, like the Supabase public buckets
done

mc admin user add local "$S3_ACCESS_KEY" "$S3_SECRET_KEY" || echo "(app user may already exist)"
mc admin policy attach local readwrite --user "$S3_ACCESS_KEY" || echo "(policy may already be attached)"

if [ -n "$EXPORT_DIR" ]; then
  for b in $BUCKETS; do
    if [ -d "$EXPORT_DIR/$b" ]; then
      echo "Uploading $EXPORT_DIR/$b ..."
      mc cp --recursive "$EXPORT_DIR/$b/" "local/$b/"
    else
      echo "NOTE: $EXPORT_DIR/$b not found, skipped"
    fi
  done
fi

echo "Object counts (expected: events 29, member-photos 59, news-image 56, execpics 10, resource-image 5):"
for b in $BUCKETS; do
  printf '%s: ' "$b"; mc ls --recursive "local/$b" | wc -l
done
