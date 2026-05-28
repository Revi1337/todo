#!/bin/sh
set -e

DB_FILE="backend/db/todo.db"
BACKUP_FILE="backend/db/backup.sql"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: $BACKUP_FILE not found"
  exit 1
fi

mkdir -p "$(dirname "$DB_FILE")"
rm -f "$DB_FILE"
sqlite3 "$DB_FILE" < "$BACKUP_FILE"
echo "Restored $DB_FILE from $BACKUP_FILE"
