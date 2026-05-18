import { db } from '@/lib/db/connection';
import { SiteSettings } from '@/types';

type SiteSettingsRow = {
  id: number;
  site_name: string;
  challenge_tracks: string | null;
  logo_url: string | null;
  logo_size: number | null;
  updated_at: string;
};

const DEFAULT_CHALLENGE_TRACKS = ['CTF', 'HackTheBox', 'TryHackMe', 'VulnHub', 'Bug Bounty', 'CVE'];

db.exec(`
  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_name TEXT NOT NULL DEFAULT 'CTFlogs',
    challenge_tracks TEXT NOT NULL DEFAULT '[]',
    logo_url TEXT,
    logo_size INTEGER,
    updated_at TEXT NOT NULL
  );
`);

const settingColumns = db.prepare("PRAGMA table_info('site_settings')").all() as Array<{ name: string }>;
if (!settingColumns.some((column) => column.name === 'challenge_tracks')) {
  db.exec(`ALTER TABLE site_settings ADD COLUMN challenge_tracks TEXT NOT NULL DEFAULT '[]';`);
}

const existing = db.prepare('SELECT id FROM site_settings WHERE id = 1').get() as { id: number } | undefined;
if (!existing) {
  db.prepare(`
    INSERT INTO site_settings (id, site_name, challenge_tracks, logo_url, logo_size, updated_at)
    VALUES (1, 'CTFlogs', ?, NULL, NULL, ?)
  `).run(JSON.stringify(DEFAULT_CHALLENGE_TRACKS), new Date().toISOString());
}

db.prepare("UPDATE site_settings SET site_name = 'CTFlogs' WHERE id = 1 AND site_name = 'PwnTrends'").run();

function toSettings(row: SiteSettingsRow): SiteSettings {
  const parsedTracks = parseChallengeTracks(row.challenge_tracks);

  return {
    siteName: row.site_name,
    challengeTracks: parsedTracks.length > 0 ? parsedTracks : DEFAULT_CHALLENGE_TRACKS,
    logoUrl: row.logo_url ?? undefined,
    logoSize: row.logo_size ?? undefined,
    updatedAt: row.updated_at,
  };
}

function parseChallengeTracks(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((track) => String(track).trim())
      .filter(Boolean)
      .filter((track, index, list) => list.indexOf(track) === index)
      .slice(0, 30);
  } catch {
    return [];
  }
}

export function getSiteSettings() {
  const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get() as SiteSettingsRow;
  return toSettings(row);
}

export function updateSiteSettings(input: { siteName?: string; challengeTracks?: string[]; logoUrl?: string | null; logoSize?: number | null }) {
  const current = getSiteSettings();
  const normalizedName = input.siteName?.trim();
  const nextName = normalizedName && normalizedName.length > 0 ? normalizedName.slice(0, 40) : current.siteName;
  const nextTracks =
    input.challengeTracks === undefined
      ? current.challengeTracks ?? DEFAULT_CHALLENGE_TRACKS
      : input.challengeTracks
          .map((track) => track.trim())
          .filter(Boolean)
          .filter((track, index, list) => list.indexOf(track) === index)
          .slice(0, 30);
  const nextLogoUrl = input.logoUrl === undefined ? current.logoUrl ?? null : input.logoUrl;
  const nextLogoSize = input.logoSize === undefined ? current.logoSize ?? null : input.logoSize;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE site_settings
    SET site_name = ?, challenge_tracks = ?, logo_url = ?, logo_size = ?, updated_at = ?
    WHERE id = 1
  `).run(nextName, JSON.stringify(nextTracks.length > 0 ? nextTracks : DEFAULT_CHALLENGE_TRACKS), nextLogoUrl, nextLogoSize, now);

  return getSiteSettings();
}
