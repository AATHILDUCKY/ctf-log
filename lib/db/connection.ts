import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'data', 'secwriteups.sqlite');
const dbDir = path.dirname(dbPath);

// Ensure the SQLite directory exists (common issue on fresh VPS deploys).
fs.mkdirSync(dbDir, { recursive: true });

export const db = new Database(dbPath);

// Safer default across VPS/storage providers; WAL can fail on some filesystems.
const journalMode = (process.env.SQLITE_JOURNAL_MODE ?? 'DELETE').toUpperCase();
db.pragma(`journal_mode = ${journalMode}`);
db.pragma('foreign_keys = ON');
