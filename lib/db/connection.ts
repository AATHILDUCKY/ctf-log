import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'data', 'secwriteups.sqlite');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
