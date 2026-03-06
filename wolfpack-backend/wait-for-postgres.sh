#!/bin/bash
# wait-for-postgres.sh - 等待 PostgreSQL 就绪

set -e

host="$1"
port="${2:-5432}"
shift 2
cmd="$@"

echo "Waiting for PostgreSQL at $host:$port..."

until pg_isready -h "$host" -p "$port" -U "wolfpack" >/dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping 1s"
  sleep 1
done

echo "PostgreSQL is up - starting application"
exec $cmd
