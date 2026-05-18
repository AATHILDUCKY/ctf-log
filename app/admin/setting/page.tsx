import AdminSettingsManager from '@/components/AdminSettingsManager';
import AdminShell from '@/components/AdminShell';
import { getSiteSettings } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';

export default function AdminSettingPage() {
  const settings = getSiteSettings();

  return (
    <AdminShell eyebrow="Setting" title="Site settings">
      <AdminSettingsManager
        initialSettings={{
          siteName: settings.siteName,
          challengeTracks: settings.challengeTracks ?? [],
        }}
      />
    </AdminShell>
  );
}
