#!/bin/sh
set -e

DB_FILE="backend/db/todo.db"
BACKUP_FILE="backend/db/backup.sql"

if [ ! -f "$DB_FILE" ]; then
  echo "ERROR: $DB_FILE not found"
  exit 1
fi

sqlite3 "$DB_FILE" .dump > "$BACKUP_FILE"
echo "Backup saved to $BACKUP_FILE"
