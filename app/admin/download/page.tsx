import AdminShell from '@/components/AdminShell';
import AdminBulkDownload from '@/components/AdminBulkDownload';
import { listWriteupItems } from '@/lib/db/writeups';

export const dynamic = 'force-dynamic';

export default function AdminDownloadPage() {
  const writeups = listWriteupItems({ includePrivate: true });

  return (
    <AdminShell eyebrow="Export" title="Bulk Download">
      <AdminBulkDownload initialWriteups={writeups} />
    </AdminShell>
  );
}
