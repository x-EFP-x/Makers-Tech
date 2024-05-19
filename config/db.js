import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: "libsql://caring-monstress-hard32x.turso.io",
  authToken: process.env.DB_TOKEN
});

const initializeDatabase = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      user TEXT
    )
  `);
};

initializeDatabase();

export default db;
