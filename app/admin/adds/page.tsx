import AdminShell from '@/components/AdminShell';
import AdminAdsManager from '@/components/AdminAdsManager';
import { listAds } from '@/lib/db/ads';

export const dynamic = 'force-dynamic';

export default function AdminAddsPage() {
  const ads = listAds();

  return (
    <AdminShell eyebrow="Adds" title="Ad placements">
      <AdminAdsManager initialAds={ads} />
    </AdminShell>
  );
}
