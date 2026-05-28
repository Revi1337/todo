CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL UNIQUE,
  color      TEXT     NOT NULL DEFAULT '#6366f1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT    NOT NULL UNIQUE,
  color TEXT    DEFAULT '#94a3b8'
);

CREATE TABLE IF NOT EXISTS todos (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  title        TEXT     NOT NULL,
  description  TEXT,
  completed    BOOLEAN  NOT NULL DEFAULT 0,
  priority     TEXT     NOT NULL CHECK(priority IN ('HIGH','MEDIUM','LOW')) DEFAULT 'MEDIUM',
  due_date     DATE,
  category_id  INTEGER  REFERENCES categories(id) ON DELETE SET NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS todo_tags (
  todo_id INTEGER NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_todos_category_id   ON todos(category_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date       ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_completed      ON todos(completed, completed_at);
