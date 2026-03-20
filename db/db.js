import * as SQLite from "expo-sqlite";

// required fields:
// id (PRIMARY KEY)
// title (TEXT)
// content (TEXT)
// createdAt (TEXT)
// updatedAt (TEXT)
// color (TEXT)
// pinned (INTEGER 0/1)

const db = SQLite.openDatabaseSync("notes.db");
export default db;

// create table
export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT,
      content TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      color TEXT,
      pinned INTEGER
    );
  `);
};

export const insertNote = (note) => {
  db.runSync(
    `INSERT INTO notes (id, title, content, createdAt, updatedAt, color, pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id,
      note.title,
      note.content,
      note.createdAt,
      note.updatedAt,
      note.color,
      note.pinned ? 1 : 0,
    ],
  );
};
