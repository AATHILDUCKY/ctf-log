import type { Metadata } from 'next';
import Dashboard from '@/components/Dashboard';
import { listAds } from '@/lib/db/ads';
import { getSiteSettings } from '@/lib/db/settings';
import { getPublicWriteupStats, queryPublicWriteups } from '@/lib/db/writeups';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cyber Security News',
  description: 'Latest cyber security news, vulnerability disclosures, threat intelligence, and exploit research.',
};

export default function NewsPage() {
  const { writeups, total, page, pageSize } = queryPublicWriteups({ query: '', page: 1, pageSize: 10, category: 'News' });
  const stats = getPublicWriteupStats();
  const ads = listAds({ activeOnly: true });
  const settings = getSiteSettings();

  return (
    <Dashboard
      writeups={writeups}
      ads={ads}
      challengeTracks={settings.challengeTracks ?? []}
      initialSearchQuery=""
      initialTotal={total}
      initialPage={page}
      pageSize={pageSize}
      initialStats={stats}
      initialCategory="News"
    />
  );
}
