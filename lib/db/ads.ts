import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db/connection';
import { Ad, AdInput, AdPlacement } from '@/types';

type AdRow = {
  id: string;
  title: string;
  type: Ad['type'];
  placement: AdPlacement;
  status: Ad['status'];
  image_url: string | null;
  image_size: number | null;
  link_url: string | null;
  alt_text: string | null;
  google_code: string | null;
  sponsor_label: string | null;
  popup_interval_seconds: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

db.exec(`
  CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    placement TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'paused',
    image_url TEXT,
    image_size INTEGER,
    link_url TEXT,
    alt_text TEXT,
    google_code TEXT,
    sponsor_label TEXT,
    popup_interval_seconds INTEGER NOT NULL DEFAULT 120,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_ads_status_placement ON ads(status, placement, sort_order);
`);

const adColumns = db.prepare("PRAGMA table_info('ads')").all() as Array<{ name: string }>;
if (!adColumns.some((column) => column.name === 'popup_interval_seconds')) {
  db.exec('ALTER TABLE ads ADD COLUMN popup_interval_seconds INTEGER NOT NULL DEFAULT 120;');
}

function toAd(row: AdRow): Ad {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    placement: row.placement,
    status: row.status,
    imageUrl: row.image_url ?? undefined,
    imageSize: row.image_size ?? undefined,
    linkUrl: row.link_url ?? undefined,
    altText: row.alt_text ?? undefined,
    googleCode: row.google_code ?? undefined,
    sponsorLabel: row.sponsor_label ?? undefined,
    popupIntervalSeconds: row.popup_interval_seconds ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeAd(input: AdInput): AdInput {
  return {
    ...input,
    title: input.title.trim(),
    linkUrl: input.linkUrl?.trim() || undefined,
    altText: input.altText?.trim() || undefined,
    googleCode: input.googleCode?.trim() || undefined,
    sponsorLabel: input.sponsorLabel?.trim() || 'Sponsored',
    popupIntervalSeconds: Math.min(Math.max(Number(input.popupIntervalSeconds ?? 120) || 120, 30), 86400),
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0,
  };
}

export function listAds(options: { activeOnly?: boolean; placement?: AdPlacement } = {}) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (options.activeOnly) {
    clauses.push("status = 'active'");
  }

  if (options.placement) {
    clauses.push('placement = ?');
    params.push(options.placement);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM ads ${where} ORDER BY sort_order ASC, created_at DESC`).all(...params);
  return (rows as AdRow[]).map(toAd);
}

export function getAd(id: string) {
  const row = db.prepare('SELECT * FROM ads WHERE id = ?').get(id);
  return row ? toAd(row as AdRow) : null;
}

export function createAd(input: AdInput) {
  const ad = sanitizeAd(input);
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(`
    INSERT INTO ads (
      id, title, type, placement, status, image_url, image_size, link_url, alt_text,
      google_code, sponsor_label, popup_interval_seconds, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    ad.title,
    ad.type,
    ad.placement,
    ad.status,
    ad.imageUrl ?? null,
    ad.imageSize ?? null,
    ad.linkUrl ?? null,
    ad.altText ?? null,
    ad.googleCode ?? null,
    ad.sponsorLabel ?? 'Sponsored',
    ad.popupIntervalSeconds ?? 120,
    ad.sortOrder,
    now,
    now,
  );

  return getAd(id);
}

export function updateAd(id: string, input: AdInput) {
  const ad = sanitizeAd(input);
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE ads
    SET title = ?, type = ?, placement = ?, status = ?, image_url = ?, image_size = ?,
        link_url = ?, alt_text = ?, google_code = ?, sponsor_label = ?, popup_interval_seconds = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    ad.title,
    ad.type,
    ad.placement,
    ad.status,
    ad.imageUrl ?? null,
    ad.imageSize ?? null,
    ad.linkUrl ?? null,
    ad.altText ?? null,
    ad.googleCode ?? null,
    ad.sponsorLabel ?? 'Sponsored',
    ad.popupIntervalSeconds ?? 120,
    ad.sortOrder,
    now,
    id,
  );

  return getAd(id);
}

export function deleteAd(id: string) {
  const result = db.prepare('DELETE FROM ads WHERE id = ?').run(id);
  return result.changes > 0;
}
