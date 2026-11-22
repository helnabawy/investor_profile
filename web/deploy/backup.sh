#!/bin/sh
# Nightly backup: a database dump and a copy of the uploaded files, kept for BACKUP_KEEP_DAYS days,
# with an optional off-site copy through rclone (e.g. to Cloudflare R2).
# Run from anywhere:  sh deploy/backup.sh      Cron example in docs/DEPLOYMENT-VPS.md.
set -eu
cd "$(dirname "$0")/.."

# Read only the backup settings; the rest of deploy/.env is Docker Compose's business.
setting() { sed -n "s/^$1=//p" deploy/.env | tail -n 1; }
dir=$(setting BACKUP_DIR); dir=${dir:-/var/backups/estateprofile}
keep=$(setting BACKUP_KEEP_DAYS); keep=${keep:-14}
remote=$(setting BACKUP_RCLONE_REMOTE)

compose="docker compose -f docker-compose.prod.yml --env-file deploy/.env"
stamp=$(date -u +%Y%m%d-%H%M%S)
mkdir -p "$dir"

# Write to a temporary name first so a failed run never leaves a file that looks like a good backup.
$compose exec -T db pg_dump -U supabase_admin -d postgres --format=custom > "$dir/db-$stamp.dump.part"
mv "$dir/db-$stamp.dump.part" "$dir/db-$stamp.dump"

$compose exec -T storage tar -czf - -C /mnt . > "$dir/media-$stamp.tar.gz.part"
mv "$dir/media-$stamp.tar.gz.part" "$dir/media-$stamp.tar.gz"

find "$dir" -type f \( -name 'db-*.dump' -o -name 'media-*.tar.gz' -o -name '*.part' \) -mtime +"$keep" -delete

if [ -n "$remote" ]; then
  rclone copy "$dir/db-$stamp.dump" "$remote"
  rclone copy "$dir/media-$stamp.tar.gz" "$remote"
fi
echo "backup $stamp done: $(du -sh "$dir" | cut -f1) in $dir"
