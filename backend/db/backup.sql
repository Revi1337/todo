PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE test (id INTEGER PRIMARY KEY);
CREATE TABLE categories (id integer, color varchar(255) not null, created_at timestamp, name varchar(255) not null unique, primary key (id));
CREATE TABLE tags (id integer, color varchar(255), name varchar(255) not null unique, primary key (id));
CREATE TABLE todo_tags (todo_id bigint not null, tag_id bigint not null, primary key (todo_id, tag_id));
CREATE TABLE todos (id integer, completed boolean not null, completed_at timestamp, created_at timestamp not null, description varchar(255), due_date date, priority varchar(255) not null check (priority in ('HIGH','MEDIUM','LOW')), title varchar(255) not null, updated_at timestamp not null, category_id bigint, primary key (id));
COMMIT;
