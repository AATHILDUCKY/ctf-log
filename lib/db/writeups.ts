import { randomUUID } from 'node:crypto';
import { mockWriteups } from '@/data/writeups';
import { db } from '@/lib/db/connection';
import { stripMarkdown } from '@/lib/seo';
import { slugifyWriteupTitle } from '@/lib/writeupRoutes';
import { Writeup, WriteupInput, WriteupListItem, WriteupStatus } from '@/types';

type WriteupRow = {
  id: string;
  slug: string | null;
  title: string;
  category: string;
  tags: string;
  author: string;
  date: string;
  summary: string;
  content: string;
  difficulty: Writeup['difficulty'] | null;
  views: number | null;
  word_count: number | null;
  reading_time_minutes: number | null;
  status: WriteupStatus;
  created_at: string;
  updated_at: string;
};

db.exec(`
  CREATE TABLE IF NOT EXISTS writeups (
    id TEXT PRIMARY KEY,
    slug TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    author TEXT NOT NULL,
    date TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    difficulty TEXT,
    views INTEGER NOT NULL DEFAULT 0,
    word_count INTEGER NOT NULL DEFAULT 0,
    reading_time_minutes INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'private',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_writeups_status_date ON writeups(status, date DESC);
  CREATE INDEX IF NOT EXISTS idx_writeups_category ON writeups(category);
  CREATE INDEX IF NOT EXISTS idx_writeups_slug ON writeups(slug);

  CREATE VIRTUAL TABLE IF NOT EXISTS writeups_fts USING fts5(
    id UNINDEXED,
    title,
    category,
    tags,
    summary,
    content
  );
`);

const writeupColumns = db.prepare("PRAGMA table_info('writeups')").all() as Array<{ name: string }>;
if (!writeupColumns.some((column) => column.name === 'slug')) {
  db.exec('ALTER TABLE writeups ADD COLUMN slug TEXT;');
}
if (!writeupColumns.some((column) => column.name === 'views')) {
  db.exec('ALTER TABLE writeups ADD COLUMN views INTEGER NOT NULL DEFAULT 0;');
}
if (!writeupColumns.some((column) => column.name === 'word_count')) {
  db.exec('ALTER TABLE writeups ADD COLUMN word_count INTEGER NOT NULL DEFAULT 0;');
}
if (!writeupColumns.some((column) => column.name === 'reading_time_minutes')) {
  db.exec('ALTER TABLE writeups ADD COLUMN reading_time_minutes INTEGER NOT NULL DEFAULT 1;');
}

const count = db.prepare('SELECT COUNT(*) AS count FROM writeups').get() as { count: number };

if (count.count === 0) {
  const seed = db.prepare(`
    INSERT INTO writeups (
      id, title, category, tags, author, date, summary, content, difficulty, status, created_at, updated_at
    ) VALUES (
      @id, @title, @category, @tags, @author, @date, @summary, @content, @difficulty, @status, @createdAt, @updatedAt
    )
  `);

  const seedMany = db.transaction((writeups: Writeup[]) => {
    for (const writeup of writeups) {
      seed.run({ ...writeup, tags: JSON.stringify(writeup.tags), difficulty: writeup.difficulty ?? null });
    }
  });

  seedMany(mockWriteups);
}

db.exec("UPDATE writeups SET slug = lower(replace(trim(title), ' ', '-')) WHERE slug IS NULL OR trim(slug) = '';");
db.exec('UPDATE writeups SET word_count = 0 WHERE word_count IS NULL;');
db.exec('UPDATE writeups SET reading_time_minutes = 1 WHERE reading_time_minutes IS NULL OR reading_time_minutes < 1;');

const writeupCount = db.prepare('SELECT COUNT(*) AS count FROM writeups').get() as { count: number };
const ftsCount = db.prepare('SELECT COUNT(*) AS count FROM writeups_fts').get() as { count: number };
if (ftsCount.count !== writeupCount.count) {
  rebuildWriteupsSearchIndex();
}

function toWriteup(row: WriteupRow): Writeup {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    title: row.title,
    category: row.category,
    tags: JSON.parse(row.tags) as string[],
    author: row.author,
    date: row.date,
    summary: row.summary,
    content: row.content,
    difficulty: row.difficulty ?? undefined,
    status: row.status,
    views: row.views ?? 0,
    wordCount: row.word_count ?? 0,
    readingTimeMinutes: row.reading_time_minutes ?? 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toWriteupListItem(row: Omit<WriteupRow, 'content'>): WriteupListItem {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    title: row.title,
    category: row.category,
    tags: JSON.parse(row.tags) as string[],
    author: row.author,
    date: row.date,
    summary: row.summary,
    difficulty: row.difficulty ?? undefined,
    views: row.views ?? 0,
    wordCount: row.word_count ?? 0,
    readingTimeMinutes: row.reading_time_minutes ?? 1,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeInput(input: WriteupInput): WriteupInput {
  const normalizedTitle = input.title.trim();
  const normalizedSlug = slugifyWriteupTitle(String(input.slug ?? '').trim());
  const cleanedContent = input.content.trim();
  const wordCount = stripMarkdown(cleanedContent).split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

  return {
    ...input,
    title: normalizedTitle,
    slug: normalizedSlug || slugifyWriteupTitle(normalizedTitle),
    author: input.author.trim(),
    summary: input.summary.trim(),
    content: cleanedContent,
    tags: normalizeTags(input.tags),
    wordCount,
    readingTimeMinutes,
    status: input.status,
  };
}

function normalizeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .flatMap((tag) => tag.split(','))
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean),
    ),
  );
}

function uniqueSlug(baseSlug: string, currentId?: string) {
  const fallbackSlug = baseSlug || 'writeup';
  let slug = fallbackSlug;
  let suffix = 2;

  while (true) {
    const existing = db.prepare('SELECT id FROM writeups WHERE slug = ? LIMIT 1').get(slug) as { id: string } | undefined;
    if (!existing || existing.id === currentId) return slug;

    slug = `${fallbackSlug}-${suffix}`;
    suffix += 1;
  }
}

export function listWriteups(options: { includePrivate?: boolean } = {}) {
  const rows = options.includePrivate
    ? db.prepare('SELECT * FROM writeups ORDER BY date DESC, updated_at DESC').all()
    : db.prepare("SELECT * FROM writeups WHERE status = 'public' ORDER BY date DESC, updated_at DESC").all();

  return (rows as WriteupRow[]).map(toWriteup);
}

export function queryPublicWriteups({
  page = 1,
  pageSize = 10,
  query = '',
  category,
}: {
  page?: number;
  pageSize?: number;
  query?: string;
  category?: string | 'All';
}) {
  const safePage = Number.isFinite(page) ? Math.max(Math.floor(page), 1) : 1;
  const safePageSize = Number.isFinite(pageSize) ? Math.floor(pageSize) : 10;
  const limit = Math.min(Math.max(safePageSize, 1), 50);
  const offset = (safePage - 1) * limit;
  const normalizedCategory = category && category !== 'All' ? category : null;
  const matchQuery = toFtsQuery(query);

  const baseSelect = `
    SELECT id, slug, title, category, tags, author, date, summary, difficulty, views, word_count, reading_time_minutes, status, created_at, updated_at
    FROM writeups
    WHERE status = 'public'
    ${normalizedCategory ? 'AND category = @category' : ''}
    ORDER BY date DESC, updated_at DESC
    LIMIT @limit OFFSET @offset
  `;

  const baseCount = `
    SELECT COUNT(*) AS count
    FROM writeups
    WHERE status = 'public'
    ${normalizedCategory ? 'AND category = @category' : ''}
  `;

  if (!matchQuery) {
    const params = { category: normalizedCategory, limit, offset };
    const rows = db.prepare(baseSelect).all(params) as Omit<WriteupRow, 'content'>[];
    const total = db.prepare(baseCount).get(params) as { count: number };
    return { writeups: rows.map(toWriteupListItem), total: total.count, page: safePage, pageSize: limit };
  }

  const searchParams = { query: matchQuery, category: normalizedCategory, limit, offset };
  const categoryFilter = normalizedCategory ? 'AND w.category = @category' : '';
  const rows = db.prepare(`
    SELECT w.id, w.slug, w.title, w.category, w.tags, w.author, w.date, w.summary, w.difficulty, w.views, w.word_count, w.reading_time_minutes, w.status, w.created_at, w.updated_at,
      bm25(writeups_fts, 9, 6, 5, 3, 1) AS rank
    FROM writeups_fts
    JOIN writeups w ON w.id = writeups_fts.id
    WHERE writeups_fts MATCH @query
      AND w.status = 'public'
      ${categoryFilter}
    ORDER BY rank ASC, w.date DESC, w.updated_at DESC
    LIMIT @limit OFFSET @offset
  `).all(searchParams) as (Omit<WriteupRow, 'content'> & { rank: number })[];

  const total = db.prepare(`
    SELECT COUNT(*) AS count
    FROM writeups_fts
    JOIN writeups w ON w.id = writeups_fts.id
    WHERE writeups_fts MATCH @query
      AND w.status = 'public'
      ${categoryFilter}
  `).get(searchParams) as { count: number };

  return { writeups: rows.map(toWriteupListItem), total: total.count, page: safePage, pageSize: limit };
}

export function listPublicWriteupSitemapEntries() {
  const rows = db.prepare(`
    SELECT id, slug, title, date, updated_at
    FROM writeups
    WHERE status = 'public'
    ORDER BY date DESC, updated_at DESC
  `).all() as Pick<WriteupRow, 'id' | 'slug' | 'title' | 'date' | 'updated_at'>[];

  return rows.map((row) => ({
    ...row,
    slug: row.slug ?? undefined,
  }));
}

export function getPublicWriteupStats() {
  const row = db.prepare(`
    SELECT COUNT(*) AS totalWriteups, COALESCE(SUM(views), 0) AS totalViews
    FROM writeups
    WHERE status = 'public'
  `).get() as { totalWriteups: number; totalViews: number };

  return {
    totalWriteups: row.totalWriteups,
    totalViews: row.totalViews,
  };
}

export function listRelatedWriteups(writeup: Writeup, limit = 3) {
  const currentTags = new Set(writeup.tags.map((tag) => tag.toLowerCase()));
  const rows = db.prepare(`
    SELECT id, slug, title, category, tags, author, date, summary, difficulty, views, word_count, reading_time_minutes, status, created_at, updated_at
    FROM writeups
    WHERE status = 'public' AND id != ?
    ORDER BY date DESC, updated_at DESC
  `).all(writeup.id) as Omit<WriteupRow, 'content'>[];

  return rows
    .map((row) => {
      const item = toWriteupListItem(row);
      const sharedTags = item.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length;
      const categoryScore = item.category === writeup.category ? 3 : 0;
      const difficultyScore = item.difficulty === writeup.difficulty ? 1 : 0;

      return {
        item,
        score: sharedTags * 4 + categoryScore + difficultyScore,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.item.date).getTime() - new Date(a.item.date).getTime())
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function getWriteup(id: string, options: { includePrivate?: boolean } = {}) {
  const row = options.includePrivate
    ? db.prepare('SELECT * FROM writeups WHERE id = ?').get(id)
    : db.prepare("SELECT * FROM writeups WHERE id = ? AND status = 'public'").get(id);

  return row ? toWriteup(row as WriteupRow) : null;
}

export function getWriteupBySlug(slug: string, options: { includePrivate?: boolean } = {}) {
  const normalizedSlug = slugifyWriteupTitle(slug);
  const row = options.includePrivate
    ? db.prepare('SELECT * FROM writeups WHERE slug = ? ORDER BY date DESC, updated_at DESC LIMIT 1').get(normalizedSlug)
    : db.prepare("SELECT * FROM writeups WHERE slug = ? AND status = 'public' ORDER BY date DESC, updated_at DESC LIMIT 1").get(normalizedSlug);

  return row ? toWriteup(row as WriteupRow) : null;
}

export function createWriteup(input: WriteupInput) {
  const writeup = sanitizeInput(input);
  const now = new Date().toISOString();
  const id = randomUUID();
  const slug = uniqueSlug(writeup.slug ?? slugifyWriteupTitle(writeup.title), id);

  db.prepare(`
    INSERT INTO writeups (
      id, slug, title, category, tags, author, date, summary, content, difficulty, views, word_count, reading_time_minutes, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    writeup.title,
    writeup.category,
    JSON.stringify(writeup.tags),
    writeup.author,
    writeup.date,
    writeup.summary,
    writeup.content,
    writeup.difficulty ?? null,
    0,
    writeup.wordCount ?? 0,
    writeup.readingTimeMinutes ?? 1,
    writeup.status,
    now,
    now,
  );

  const saved = getWriteup(id, { includePrivate: true });
  if (saved) upsertWriteupSearchIndex(saved);
  return saved;
}

export function updateWriteup(id: string, input: WriteupInput) {
  const writeup = sanitizeInput(input);
  const now = new Date().toISOString();
  const slug = uniqueSlug(writeup.slug ?? slugifyWriteupTitle(writeup.title), id);

  db.prepare(`
    UPDATE writeups
    SET slug = ?, title = ?, category = ?, tags = ?, author = ?, date = ?, summary = ?, content = ?, difficulty = ?, word_count = ?, reading_time_minutes = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(
    slug,
    writeup.title,
    writeup.category,
    JSON.stringify(writeup.tags),
    writeup.author,
    writeup.date,
    writeup.summary,
    writeup.content,
    writeup.difficulty ?? null,
    writeup.wordCount ?? 0,
    writeup.readingTimeMinutes ?? 1,
    writeup.status,
    now,
    id,
  );

  const saved = getWriteup(id, { includePrivate: true });
  if (saved) upsertWriteupSearchIndex(saved);
  return saved;
}

export function deleteWriteup(id: string) {
  const result = db.prepare('DELETE FROM writeups WHERE id = ?').run(id);
  db.prepare('DELETE FROM writeups_fts WHERE id = ?').run(id);
  return result.changes > 0;
}

export function incrementWriteupViews(id: string) {
  const result = db.prepare(`
    UPDATE writeups
    SET views = COALESCE(views, 0) + 1
    WHERE id = ? AND status = 'public'
  `).run(id);

  return result.changes > 0;
}

function rebuildWriteupsSearchIndex() {
  db.prepare('DELETE FROM writeups_fts').run();
  const rows = db.prepare('SELECT * FROM writeups').all() as WriteupRow[];
  const insert = db.prepare(`
    INSERT INTO writeups_fts (id, title, category, tags, summary, content)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((writeups: WriteupRow[]) => {
    for (const row of writeups) {
      insert.run(row.id, row.title, row.category, row.tags, row.summary, row.content);
    }
  });

  insertMany(rows);
}

function upsertWriteupSearchIndex(writeup: Writeup) {
  db.prepare('DELETE FROM writeups_fts WHERE id = ?').run(writeup.id);
  db.prepare(`
    INSERT INTO writeups_fts (id, title, category, tags, summary, content)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(writeup.id, writeup.title, writeup.category, writeup.tags.join(' '), writeup.summary, writeup.content);
}

function toFtsQuery(query: string) {
  const terms = query
    .toLowerCase()
    .replace(/[^\w\s".+#-]/g, ' ')
    .replace(/"/g, ' ')
    .split(/\s+/)
    .map((term) => term.trim().replace(/[^a-z0-9_]/g, ''))
    .filter((term) => term.length > 1)
    .slice(0, 8);

  return terms.length > 0 ? terms.map((term) => `${term}*`).join(' OR ') : '';
}
