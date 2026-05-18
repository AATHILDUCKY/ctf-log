import { notFound } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import WriteupDetail from '@/components/WriteupDetail';
import { getWriteup } from '@/lib/db/writeups';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

export default async function AdminWriteupPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const writeup = getWriteup(id, { includePrivate: true });

  if (!writeup) {
    notFound();
  }

  return (
    <AdminShell eyebrow="Writeups" title="Preview writeup">
      <WriteupDetail writeup={writeup} backHref="/admin/writeups" />
    </AdminShell>
  );
}
