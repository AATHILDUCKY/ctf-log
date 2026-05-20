import AdminContactMessages from '@/components/AdminContactMessages';
import AdminShell from '@/components/AdminShell';
import { getContactMessageStats, listContactMessages } from '@/lib/db/contactMessages';

export const dynamic = 'force-dynamic';

export default function AdminMessagesPage() {
  const stats = getContactMessageStats();

  return (
    <AdminShell eyebrow="Messages" title={`Contact inbox (${stats.unread} new)`}>
      <AdminContactMessages initialMessages={listContactMessages()} />
    </AdminShell>
  );
}
