import type { MetadataRoute } from 'next';
import { listSitePages } from '@/lib/db/sitePages';
import { listPublicWriteupSitemapEntries } from '@/lib/db/writeups';
import { siteConfig, writeupUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const writeups = listPublicWriteupSitemapEntries();
  const pages = listSitePages();
  const now = new Date();

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...pages.map((page) => ({
      url: `${siteConfig.url}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: page.slug === 'about' || page.slug === 'contact' ? 0.75 : 0.55,
    })),
    ...writeups.map((writeup) => ({
      url: writeupUrl(writeup),
      lastModified: new Date(writeup.updated_at || writeup.date),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];
}
