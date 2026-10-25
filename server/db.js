import { DatabaseSync } from 'node:sqlite';

export function openDb(path) {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('Celulares','Laptops','Accesorios')),
      price_cents INTEGER NOT NULL CHECK (price_cents > 0),
      description TEXT NOT NULL,
      specs TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL
    )
  `);
  return db;
}
