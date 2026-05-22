import { Suspense } from 'react';
import Link from 'next/link';
import { FilePlus2 } from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import AdminWriteupsList from '@/components/AdminWriteupsList';
import { listWriteups } from '@/lib/db/writeups';

export const dynamic = 'force-dynamic';

export default function AdminWriteupsPage() {
  const writeups = listWriteups({ includePrivate: true });

  return (
    <AdminShell
      eyebrow="Writeups"
      title="Manage writeups"
      action={
        <Link href="/admin/writeups/new" className="inline-flex items-center gap-2 rounded-md bg-dracula-green px-3 py-2 text-sm font-bold text-dracula-bg hover:brightness-95">
          <FilePlus2 className="h-4 w-4" />
          New writeup
        </Link>
      }
    >
      <Suspense>
        <AdminWriteupsList initialWriteups={writeups} />
      </Suspense>
    </AdminShell>
  );
}
