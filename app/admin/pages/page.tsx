import AdminPagesManager from '@/components/AdminPagesManager';
import AdminShell from '@/components/AdminShell';
import { listSitePages } from '@/lib/db/sitePages';

export const dynamic = 'force-dynamic';

export default function AdminPagesPage() {
  return (
    <AdminShell eyebrow="Pages" title="Site pages">
      <AdminPagesManager initialPages={listSitePages()} />
    </AdminShell>
  );
}
