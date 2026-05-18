import AdminShell from '@/components/AdminShell';
import AdminAnalyticsCharts from '@/components/AdminAnalyticsCharts';
import { listWriteups } from '@/lib/db/writeups';

export const dynamic = 'force-dynamic';

export default function AdminAnalyticsPage() {
  const writeups = listWriteups({ includePrivate: true });
  const publicCount = writeups.filter((writeup) => writeup.status === 'public').length;
  const privateCount = writeups.length - publicCount;
  const tagCount = new Set(writeups.flatMap((writeup) => writeup.tags)).size;
  const totalWords = writeups.reduce((sum, writeup) => sum + writeup.content.split(/\s+/).filter(Boolean).length, 0);

  // Temporary deterministic view estimate until real tracking is wired from page requests.
  const writeupsWithViews = writeups.map((writeup) => {
    const estimate = 250 + writeup.title.length * 11 + writeup.tags.length * 34 + (writeup.status === 'public' ? 180 : 40);
    return {
      id: writeup.id,
      title: writeup.title,
      category: writeup.category,
      date: writeup.date,
      views: estimate,
    };
  });

  const totalViews = writeupsWithViews.reduce((sum, writeup) => sum + writeup.views, 0);
  const avgViews = writeupsWithViews.length > 0 ? Math.round(totalViews / writeupsWithViews.length) : 0;

  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });

  const monthlyData = monthLabels.map((label) => ({ month: label, writeups: 0, views: 0 }));
  const monthlyIndex = new Map(monthLabels.map((label, index) => [label, index]));

  for (const writeup of writeupsWithViews) {
    const monthKey = new Date(writeup.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const index = monthlyIndex.get(monthKey);
    if (index !== undefined) {
      monthlyData[index].writeups += 1;
      monthlyData[index].views += writeup.views;
    }
  }

  const categoryMap = new Map<string, number>();
  for (const writeup of writeupsWithViews) {
    categoryMap.set(writeup.category, (categoryMap.get(writeup.category) ?? 0) + 1);
  }
  const categoryData = Array.from(categoryMap, ([category, count]) => ({ category, writeups: count }));

  const topWriteups = [...writeupsWithViews]
    .sort((a, b) => b.views - a.views)
    .slice(0, 7)
    .map((writeup) => ({ title: writeup.title, views: writeup.views }));

  return (
    <AdminShell eyebrow="User analytics" title="Analytics overview">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Total writeups" value={writeups.length} />
          <Metric label="Public posts" value={publicCount} />
          <Metric label="Private drafts" value={privateCount} />
          <Metric label="Unique tags" value={tagCount} />
          <Metric label="Total views" value={totalViews} />
          <Metric label="Avg. views/post" value={avgViews} />
        </div>

        <section className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-8">
          <h2 className="text-xl font-bold">Performance snapshot</h2>
          <p className="mt-2 max-w-3xl text-sm text-dracula-comment">
            Views and content datasets are visualized below by trend, category share, and top-performing writeups. Estimated views are generated
            deterministically from content metadata until request-level tracking is connected.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Metric label="Total words indexed" value={totalWords} />
            <Metric label="Engagement ratio (views/word)" value={Math.max(1, Math.round(totalViews / Math.max(totalWords, 1) * 1000))} />
          </div>
        </section>

        <AdminAnalyticsCharts monthlyData={monthlyData} categoryData={categoryData} topWriteups={topWriteups} />
      </div>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-4">
      <p className="text-xs font-bold uppercase text-dracula-comment">{label}</p>
      <p className="mt-2 text-2xl font-bold text-dracula-green">{value}</p>
    </div>
  );
}
