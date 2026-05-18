import AdminShell from '@/components/AdminShell';
import AdminWriteupEditor from '@/components/AdminWriteupEditor';
import { WriteupInput } from '@/types';

export const dynamic = 'force-dynamic';

export default function NewWriteupPage() {
  const draft: WriteupInput = {
    title: '',
    slug: '',
    category: 'CTF',
    tags: [],
    author: 'Ducky',
    date: new Date().toISOString().slice(0, 10),
    summary: '',
    content: '# New writeup\n\n## Overview\n\n',
    difficulty: 'Very Easy',
    status: 'private',
  };

  return (
    <AdminShell eyebrow="Writeups" title="Create writeup">
      <AdminWriteupEditor initialDraft={draft} />
    </AdminShell>
  );
}
