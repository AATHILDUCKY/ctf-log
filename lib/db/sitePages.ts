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
    summary: 'A practical cybersecurity writeup archive for CTF players, students and ethical hackers — one searchable place for writeups, methodology notes and challenge walkthroughs.',
    seoTitle: 'About CTFlogs — CTF Writeups & Cybersecurity Notes',
    seoDescription: 'CTFlogs is a searchable archive of CTF writeups, HackTheBox walkthroughs, TryHackMe notes and ethical hacking methodology. Built for hackers who learn by reading how others solved the same problem.',
    content: `## Who We Are

CTFlogs is a focused archive for **cybersecurity learning**, practical CTF solving and ethical hacking research. We collect writeups, methodology notes and challenge walkthroughs in one searchable place.

The goal is simple: make security learning easier to revisit, compare and apply. Each writeup preserves the reasoning behind the solve — not just the final command.

## What You'll Find

- **CTF Writeups** — detailed solutions to challenges from HackTheBox, TryHackMe, PicoCTF, OSCP labs and more
- **Methodology Notes** — structured approaches to common vulnerability classes and pentesting phases
- **Tool References** — quick command references for nmap, gobuster, burpsuite, sqlmap, ffuf and more
- **Category Tags** — browse by Web, Crypto, Forensics, Reversing, Pwn, OSINT, Misc and more

## Why CTFlogs

Security writeups are scattered across personal blogs, GitHub repos, Discord servers and pastebin snippets. CTFlogs brings them into a single, searchable and consistently formatted archive — built for the way hackers actually learn: by reading how someone else solved the same problem.

Every writeup on CTFlogs is written to capture the **thought process**, not just the answer. Understanding why an exploit works matters more than copy-pasting the payload.

## Who This Is For

- **CTF players** looking for hints, post-solve comparisons or technique references
- **Students** building practical skills through hands-on ethical hacking examples
- **Professionals** maintaining structured methodology, tooling notes and technique libraries
- **Researchers** tracking attack patterns and techniques across challenge categories

---

*Got a correction or want to contribute? Use the [contact page](/contact).*`,
  },

  contact: {
    slug: 'contact',
    title: 'Contact',
    summary: 'Send writeup corrections, collaboration requests, security disclosures or general feedback — all messages go directly to the admin dashboard.',
    seoTitle: 'Contact CTFlogs — Writeup Corrections & Collaboration',
    seoDescription: 'Contact CTFlogs for writeup corrections, collaboration requests, security disclosures or sponsorship enquiries. All messages are reviewed by the site author.',
    content: `## Get in Touch

Use the form below to reach us. All messages go directly to the admin dashboard and are reviewed by the site author.

## What to Write About

- **Writeup corrections** — found a mistake, outdated technique or broken command? Tell us the challenge name and platform.
- **Collaboration requests** — want to contribute writeups, co-author a series or discuss a guest post?
- **Security disclosures** — responsible disclosure notes or vulnerability reports related to CTFlogs itself.
- **Sponsorship and partnerships** — interested in reaching the security community through CTFlogs?
- **General feedback** — topic requests, suggestions or anything else on your mind.

## Response Times

Messages are typically reviewed within **2–5 business days**. For urgent security matters, include **[SECURITY]** in your subject line to help prioritise.

## Tips for Faster Replies

- For writeup issues, include the challenge name and platform (e.g. "HackTheBox — BoardLight")
- For collaboration, briefly describe what you'd like to work on and link any relevant examples
- Keep your subject line specific — it helps triage the inbox faster

---

*Your contact details are stored privately and never shared with third parties.*`,
  },

  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'How CTFlogs handles contact form data, analytics, cookies and site information — plain language, no legal jargon.',
    seoTitle: 'Privacy Policy — CTFlogs',
    seoDescription: 'Read the CTFlogs privacy policy: how we handle contact form submissions, analytics data, cookies and your rights regarding data stored on ctflogs.com.',
    content: `## Overview

This privacy policy explains how CTFlogs (ctflogs.com) handles information collected through the site. By using CTFlogs, you agree to the practices described below.

## Information We Collect

### Contact Form Submissions

When you submit the contact form, we collect:

- Your **name** and **email address**
- The **subject** and **message** you provide

This data is stored in a private admin dashboard so we can respond to your message and manage requests.

### Automatically Collected Data

When you visit CTFlogs, our servers and analytics tools may collect:

- Pages visited and time spent on site
- Referring website or search query
- Browser type, version and language
- Operating system and device category
- Approximate location (country or city level — not precise GPS data)

This data helps us understand traffic patterns, improve content quality and protect the site from abuse.

## Cookies and Tracking

CTFlogs may use:

- **Session cookies** — required for admin panel authentication
- **Analytics cookies** — tools such as Google Analytics to measure site usage and traffic sources

You can disable or clear cookies through your browser settings. Some admin features require cookies to function correctly.

## How We Use Your Information

We use collected data to:

- Respond to contact form submissions
- Monitor and improve site performance and content quality
- Detect and prevent spam or abusive behaviour
- Comply with legal obligations when required

## Data Sharing

CTFlogs does **not** sell, rent or trade personal data. Information may be shared only:

- With service providers needed to operate the site (hosting, analytics infrastructure)
- When required by applicable law, court order or regulatory authority
- To protect the rights, safety or property of CTFlogs and its users

## Data Retention

Contact form submissions are stored until manually deleted via the admin dashboard. Analytics data is retained according to the third-party provider's own retention policies.

## Your Rights

You can request:

- **Access** — a copy of data we hold relating to you
- **Correction** — of any inaccurate contact data we hold
- **Deletion** — of your contact form submission and associated data

To make a request, use the [contact page](/contact) and include the email address used in your original message.

## Changes to This Policy

This policy may be updated from time to time. The current version is always available at this URL. Continued use of CTFlogs after updates are published means you accept the revised policy.

---

*Last reviewed: 2025*`,
  },

  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    summary: 'The usage terms for CTFlogs content, writeups, examples and contact features — educational use only, no unlawful application of techniques.',
    seoTitle: 'Terms and Conditions — CTFlogs',
    seoDescription: 'Review the CTFlogs terms and conditions covering permitted use of cybersecurity writeups, intellectual property, accuracy of content and limitation of liability.',
    content: `## Acceptance of Terms

By accessing or using CTFlogs (ctflogs.com), you agree to be bound by these terms and conditions. If you disagree with any part, please discontinue use of the site.

## Purpose and Permitted Use

CTFlogs provides cybersecurity writeups, challenge walkthroughs and methodology notes for **lawful educational purposes only**.

You may use CTFlogs content to:

- Study ethical hacking techniques and CTF challenge approaches
- Build personal knowledge for defensive security or academic work
- Reference and cite writeups with clear attribution and a direct link to the source page

You may **not** use CTFlogs content to:

- Attack, probe or test systems you do not own or have **explicit written permission** to access
- Reproduce full writeups or substantial portions without prior permission
- Scrape, mirror or republish site content at scale without prior agreement
- Spam the contact form, attempt to access admin areas or disrupt site availability in any way

## Accuracy of Content

Writeups and methodology notes are provided as educational material. Security techniques, tools and platform behaviour change over time. CTFlogs does not warrant that any content is current, complete or free of errors.

Always verify techniques in a **controlled, authorised environment** before applying them elsewhere.

## Intellectual Property

Content published on CTFlogs belongs to its respective author unless otherwise stated. The CTFlogs name, logo and site design are the property of the site owner.

Short excerpts (under 200 words) may be quoted with clear attribution and a direct link to the original page. Full reproduction or translation into another format or language requires written permission.

## Third-Party Links

CTFlogs links to external platforms including HackTheBox, TryHackMe, GitHub and others for context and reference. We are not responsible for the content, availability or privacy practices of any third-party website.

## Limitation of Liability

CTFlogs is provided **"as is"** without warranty of any kind, express or implied. To the maximum extent permitted by applicable law, the site owner is not liable for any direct, indirect, incidental or consequential damages arising from your use of CTFlogs or reliance on its content.

## Changes to These Terms

These terms may be updated at any time. The current version is always available at this URL. Continued use of CTFlogs after updates are published constitutes acceptance of the revised terms.

## Contact

For questions about these terms, use the [contact page](/contact).

---

*Effective date: 2025*`,
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

  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    run_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_site_pages_slug ON site_pages(slug);
`);

const insertPage = db.prepare(`
  INSERT OR IGNORE INTO site_pages (slug, title, summary, content, seo_title, seo_description, updated_at)
  VALUES (@slug, @title, @summary, @content, @seoTitle, @seoDescription, @updatedAt)
`);

const now = new Date().toISOString();
for (const page of Object.values(DEFAULT_PAGES)) {
  insertPage.run({ ...page, updatedAt: now });
}

// One-time migration: enrich page content, titles and SEO with full markdown defaults
const MIGRATION = 'pages_rich_content_v2';
const alreadyRun = db.prepare('SELECT name FROM _migrations WHERE name = ?').get(MIGRATION);
if (!alreadyRun) {
  const updatePage = db.prepare(`
    UPDATE site_pages
    SET title = @title, summary = @summary, content = @content,
        seo_title = @seoTitle, seo_description = @seoDescription, updated_at = @updatedAt
    WHERE slug = @slug
  `);
  for (const page of Object.values(DEFAULT_PAGES)) {
    updatePage.run({ ...page, updatedAt: now });
  }
  db.prepare('INSERT INTO _migrations (name, run_at) VALUES (?, ?)').run(MIGRATION, now);
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
    SET title = @title, summary = @summary, content = @content,
        seo_title = @seoTitle, seo_description = @seoDescription, updated_at = @updatedAt
    WHERE slug = @slug
  `).run({ slug, ...next });

  return getSitePage(slug);
}

function normalizeText(value: string | undefined, fallback: string, maxLength: number) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized.slice(0, maxLength) : fallback;
}
