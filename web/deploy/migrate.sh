#!/bin/sh
# Applies supabase/migrations/*.sql that have not run yet, in file-name order.
# Uses the same bookkeeping table as `supabase db push`, so either tool can be used on this database.
set -eu
export PGHOST="${PGHOST:-db}" PGUSER=postgres PGDATABASE=postgres PGPASSWORD="$POSTGRES_PASSWORD"

psql -v ON_ERROR_STOP=1 -q <<'SQL'
set client_min_messages = warning;
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);
SQL

for file in /migrations/*.sql; do
  [ -e "$file" ] || continue
  base=$(basename "$file" .sql)
  version=${base%%_*}
  name=${base#*_}
  case "$version" in *[!0-9]*) echo "skipping $base (name must start with a numeric version)"; continue ;; esac
  if [ "$(psql -Atc "select 1 from supabase_migrations.schema_migrations where version = '$version'")" = "1" ]; then
    continue
  fi
  echo "applying $base"
  # One transaction per file: a failing migration leaves nothing half-applied.
  psql -v ON_ERROR_STOP=1 -q -1 -f "$file" \
    -c "insert into supabase_migrations.schema_migrations (version, name) values ('$version', '$(printf %s "$name" | sed "s/'/''/g")')"
done

psql -q -c "notify pgrst, 'reload schema'"
echo "migrations up to date"
