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

export const getNotes = () => {
  return db.getAllSync(`
    SELECT * FROM notes
    ORDER BY pinned DESC, createdAt DESC
  `);
};

export const getNoteById = (id) => {
  return db.getFirstSync(`SELECT * FROM notes WHERE id = ?`, [id]);
};

export const updateNote = (note) => {
  db.runSync(
    `UPDATE notes 
     SET title = ?, content = ?, updatedAt = ?, color = ?, pinned = ?
     WHERE id = ?`,
    [
      note.title,
      note.content,
      note.updatedAt,
      note.color,
      note.pinned ? 1 : 0,
      note.id,
    ],
  );
};
