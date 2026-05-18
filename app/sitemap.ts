import type { MetadataRoute } from 'next';
import { listPublicWriteupSitemapEntries } from '@/lib/db/writeups';
import { siteConfig, writeupUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const writeups = listPublicWriteupSitemapEntries();
  const now = new Date();

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...writeups.map((writeup) => ({
      url: writeupUrl(writeup),
      lastModified: new Date(writeup.updated_at || writeup.date),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];
}
