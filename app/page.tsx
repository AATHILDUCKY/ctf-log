import type { Metadata } from 'next';
import Dashboard from '@/components/Dashboard';
import { listAds } from '@/lib/db/ads';
import { getSiteSettings } from '@/lib/db/settings';
import { getPublicWriteupStats, queryPublicWriteups } from '@/lib/db/writeups';
import { siteConfig } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CTF Writeup Hub',
  description:
    'Browse searchable CTF challenge solutions, HackTheBox writeups, TryHackMe walkthroughs, exploitation notes, CVE research and ethical hacking learning logs.',
  keywords: siteConfig.keywords,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CTFlogs - CTF Writeup Hub',
    description: siteConfig.description,
    url: siteConfig.url,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CTFlogs - CTF Writeup Hub',
    description: siteConfig.description,
  },
};

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const query = (await searchParams)?.q ?? '';
  const { writeups, total, page, pageSize } = queryPublicWriteups({ query, page: 1, pageSize: 10 });
  const stats = getPublicWriteupStats();
  const ads = listAds({ activeOnly: true });
  const settings = getSiteSettings();

  return (
    <Dashboard
      writeups={writeups}
      ads={ads}
      challengeTracks={settings.challengeTracks ?? []}
      initialSearchQuery={query}
      initialTotal={total}
      initialPage={page}
      pageSize={pageSize}
      initialStats={stats}
    />
  );
}
