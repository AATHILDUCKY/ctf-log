import { db } from '@/lib/db/connection';
import type { SitePage, SitePageSlug } from '@/types';

type SitePageRow = {
  slug: SitePageSlug;
  title: string;
  summary: string;
  content: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
};

export const SITE_PAGE_SLUGS: SitePageSlug[] = ['about', 'contact', 'privacy-policy', 'terms-and-conditions'];

const DEFAULT_PAGES: Record<SitePageSlug, Omit<SitePage, 'updatedAt'>> = {
  about: {
    slug: 'about',
    title: 'About CTFlogs',
    summary: 'A practical cybersecurity writeup archive for CTF players, students and ethical hackers.',
    seoTitle: 'About CTFlogs - Cybersecurity Writeups and CTF Notes',
    seoDescription: 'Learn about CTFlogs, a searchable archive of CTF writeups, HackTheBox walkthroughs, TryHackMe notes and ethical hacking research.',
    content:
      'CTFlogs is a focused archive for cybersecurity learning, practical CTF solving and ethical hacking research. It collects writeups, methodology notes and challenge walkthroughs in one searchable place.\n\nThe goal is simple: make security learning easier to revisit, compare and apply. Each writeup is written to preserve the reasoning behind the solve, not just the final command.',
  },
  contact: {
    slug: 'contact',
    title: 'Contact',
    summary: 'Send questions, corrections, collaboration ideas or security research notes.',
    seoTitle: 'Contact CTFlogs - Cybersecurity Writeup Archive',
    seoDescription: 'Contact CTFlogs for corrections, collaboration requests, cybersecurity research notes or CTF writeup questions.',
    content:
      'Use the contact form for writeup corrections, collaboration requests, disclosure-related notes, sponsorship questions or general feedback. Messages are reviewed from the admin dashboard.',
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'How CTFlogs handles contact form submissions, analytics, cookies and basic site data.',
    seoTitle: 'Privacy Policy - CTFlogs',
    seoDescription: 'Read the CTFlogs privacy policy covering contact forms, analytics, cookies and data handling for the cybersecurity writeup archive.',
    content:
      'This privacy policy explains how CTFlogs handles information submitted through the site.\n\nInformation you provide: When you submit the contact form, your name, email address, subject and message are stored so the site owner can reply and manage support or collaboration requests.\n\nAnalytics and logs: The site may use analytics and server logs to understand traffic, improve content and protect the service from abuse. This may include pages visited, approximate location, browser details and device information.\n\nCookies: Admin authentication and analytics tools may use cookies or similar storage. You can control cookies through your browser settings.\n\nData sharing: CTFlogs does not sell personal information. Data may be shared only when needed to operate the site, comply with law or protect the site and its users.\n\nData requests: To request deletion or correction of a submitted contact message, use the contact page and include the email address used in the original message.',
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    summary: 'The usage terms for CTFlogs content, writeups, examples and contact features.',
    seoTitle: 'Terms and Conditions - CTFlogs',
    seoDescription: 'Review the CTFlogs terms and conditions for using cybersecurity writeups, educational content and contact features.',
    content:
      'These terms govern your use of CTFlogs.\n\nEducational purpose: Content is provided for lawful cybersecurity education, CTF practice and defensive research. Do not use examples, commands or techniques against systems you do not own or do not have explicit permission to test.\n\nAccuracy: Writeups and notes are provided as learning material. While care is taken, content may contain mistakes or become outdated as platforms and tools change.\n\nIntellectual property: Site content belongs to its respective author unless otherwise stated. You may reference short excerpts with clear attribution and a link back to the original page.\n\nAcceptable use: Do not attempt to disrupt the site, bypass admin areas, spam contact forms or use the site for illegal activity.\n\nChanges: These terms may be updated from time to time. Continued use of the site means you accept the current version.',
  },
};

db.exec(`
  CREATE TABLE IF NOT EXISTS site_pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const insertPage = db.prepare(`
  INSERT OR IGNORE INTO site_pages (slug, title, summary, content, seo_title, seo_description, updated_at)
  VALUES (@slug, @title, @summary, @content, @seoTitle, @seoDescription, @updatedAt)
`);

const now = new Date().toISOString();
for (const page of Object.values(DEFAULT_PAGES)) {
  insertPage.run({ ...page, updatedAt: now });
}

function toSitePage(row: SitePageRow): SitePage {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    updatedAt: row.updated_at,
  };
}

export function isSitePageSlug(value: string): value is SitePageSlug {
  return SITE_PAGE_SLUGS.includes(value as SitePageSlug);
}

export function listSitePages() {
  const rows = db.prepare('SELECT * FROM site_pages ORDER BY slug ASC').all() as SitePageRow[];
  return rows.map(toSitePage);
}

export function getSitePage(slug: SitePageSlug) {
  const row = db.prepare('SELECT * FROM site_pages WHERE slug = ?').get(slug) as SitePageRow | undefined;
  if (!row) return null;
  return toSitePage(row);
}

export function updateSitePage(slug: SitePageSlug, input: Partial<Pick<SitePage, 'title' | 'summary' | 'content' | 'seoTitle' | 'seoDescription'>>) {
  const current = getSitePage(slug);
  if (!current) throw new Error('Page not found.');

  const next = {
    title: normalizeText(input.title, current.title, 80),
    summary: normalizeText(input.summary, current.summary, 180),
    content: normalizeText(input.content, current.content, 12000),
    seoTitle: normalizeText(input.seoTitle, input.title ?? current.seoTitle, 70),
    seoDescription: normalizeText(input.seoDescription, input.summary ?? current.seoDescription, 160),
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE site_pages
    SET title = @title, summary = @summary, content = @content, seo_title = @seoTitle, seo_description = @seoDescription, updated_at = @updatedAt
    WHERE slug = @slug
  `).run({ slug, ...next });

  return getSitePage(slug);
}

function normalizeText(value: string | undefined, fallback: string, maxLength: number) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized.slice(0, maxLength) : fallback;
}
