import { notFound } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AdminWriteupEditor from '@/components/AdminWriteupEditor';
import { getWriteup } from '@/lib/db/writeups';
import { WriteupInput } from '@/types';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

export default async function EditWriteupPage({ params }: PageProps) {
  const { id } = await params;
  const writeup = getWriteup(id, { includePrivate: true });

  if (!writeup) {
    notFound();
  }

  const draft: WriteupInput = {
    title: writeup.title,
    slug: writeup.slug ?? '',
    category: writeup.category,
    tags: writeup.tags,
    author: writeup.author,
    date: writeup.date,
    summary: writeup.summary,
    content: writeup.content,
    difficulty: writeup.difficulty,
    status: writeup.status,
  };

  return (
    <AdminShell eyebrow="Writeups" title="Edit writeup">
      <AdminWriteupEditor initialWriteup={writeup} initialDraft={draft} />
    </AdminShell>
  );
}
