import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getWriteupItemsByIds, listWriteupItems } from '@/lib/db/writeups';
import { writeupUrl } from '@/lib/seo';
import { WriteupListItem } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let ids: string[] = [];
  let format: 'md' | 'json' = 'md';

  try {
    const body = (await request.json()) as { ids?: string[]; format?: string };
    ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === 'string') : [];
    format = body.format === 'json' ? 'json' : 'md';
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const writeups = ids.length > 0 ? getWriteupItemsByIds(ids) : listWriteupItems({ includePrivate: true });
  const today = new Date().toISOString().split('T')[0];

  if (format === 'json') {
    const payload = {
      exportedAt: new Date().toISOString(),
      total: writeups.length,
      writeups: writeups.map((w) => ({
        id: w.id,
        slug: w.slug,
        url: writeupUrl(w),
        title: w.title,
        category: w.category,
        tags: w.tags,
        author: w.author,
        date: w.date,
        summary: w.summary,
        difficulty: w.difficulty,
        status: w.status,
        views: w.views,
      })),
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="writeups-export-${today}.json"`,
      },
    });
  }

  return new NextResponse(buildMarkdown(writeups, today), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="writeups-export-${today}.md"`,
    },
  });
}

function buildMarkdown(writeups: WriteupListItem[], today: string): string {
  const lines: string[] = [
    `# CTF Writeups Export`,
    ``,
    `> Generated: ${today} | Total: ${writeups.length} writeup${writeups.length !== 1 ? 's' : ''}`,
    ``,
    `---`,
    ``,
  ];

  for (const w of writeups) {
    lines.push(`## [${w.title}](${writeupUrl(w)})`);
    lines.push(``);
    lines.push(`**Category:** ${w.category} | **Status:** ${w.status} | **Date:** ${w.date}`);
    if (w.tags.length > 0) lines.push(`**Tags:** ${w.tags.join(', ')}`);
    lines.push(``);
    lines.push(w.summary);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  return lines.join('\n');
}
