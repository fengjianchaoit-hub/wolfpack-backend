#!/bin/bash
# wait-for-postgres.sh - 等待 PostgreSQL 就绪

set -e

host="$1"
port="${2:-5432}"
shift 2
cmd="$@"

until PGPASSWORD="$SPRING_DATASOURCE_PASSWORD" psql -h "$host" -p "$port" -U "$SPRING_DATASOURCE_USERNAME" -d "$SPRING_DATASOURCE_USERNAME" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "PostgreSQL is up - executing command"
exec $cmd
