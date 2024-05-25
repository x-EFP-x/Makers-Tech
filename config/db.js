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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS subject(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      line TEXT,
      prerequisites JSON,
      credits INTEGER,
      code INTEGER,
      type TEXT
    )
  `);

  await db.execute(`
  CREATE TABLE IF NOT EXISTS user(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      career TEXT,
      email TEXT,
      approvedSubjects JSON,
      completionPercentage DOUBLE
    )
  `);

  await db.execute(`
  CREATE TABLE IF NOT EXISTS user_preferences(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      preference TEXT NOT NULL,
      preference_date DATE NOT NULL,
      FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
    )
  `);
};

initializeDatabase();

export default db;
