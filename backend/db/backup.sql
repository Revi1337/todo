PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE test (id INTEGER PRIMARY KEY);
CREATE TABLE categories (id integer, color varchar(255) not null, created_at timestamp, name varchar(255) not null unique, primary key (id));
COMMIT;
