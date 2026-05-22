import AdminShell from '@/components/AdminShell';
import AdminWriteupEditor from '@/components/AdminWriteupEditor';
import { WriteupInput } from '@/types';

export const dynamic = 'force-dynamic';

const NEWS_CATEGORY = 'Cyber Security News';

const newsTemplate = `## Summary

Brief overview of the vulnerability or news item.

## Details

### Affected Systems

- Vendor / Product:
- Versions:
- CVE / Advisory:

### Impact

- Severity:
- Attack vector:
- What an attacker can do:

## Timeline

| Date | Event |
| --- | --- |
|  | Discovered |
|  | Vendor notified |
|  | Patch released |

## Mitigation

- Patch / upgrade:
- Workaround:
- Detection:

## References

- [Official advisory]()
- [NVD entry]()
`;

export default async function NewWriteupPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const category = params.category === NEWS_CATEGORY ? NEWS_CATEGORY : 'CTF';
  const isNews = category === NEWS_CATEGORY;

  const draft: WriteupInput = {
    title: '',
    slug: '',
    category,
    tags: isNews ? ['cybersecurity', 'news'] : [],
    author: 'Ducky',
    date: new Date().toISOString().slice(0, 10),
    summary: '',
    content: isNews ? newsTemplate : '# New writeup\n\n## Overview\n\n',
    difficulty: isNews ? undefined : 'Very Easy',
    status: 'private',
  };

  return (
    <AdminShell eyebrow={isNews ? 'News' : 'Writeups'} title={isNews ? 'Add news article' : 'Create writeup'}>
      <AdminWriteupEditor initialDraft={draft} />
    </AdminShell>
  );
}
