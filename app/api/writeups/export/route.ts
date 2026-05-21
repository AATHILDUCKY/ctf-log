import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { listWriteups } from '@/lib/db/writeups';
import { writeupUrl } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const writeups = listWriteups({ includePrivate: true });
  const today = new Date().toISOString().split('T')[0];

  const lines: string[] = [
    `# CTF Writeups Export`,
    ``,
    `> Generated: ${today} | Total: ${writeups.length} writeup${writeups.length !== 1 ? 's' : ''}`,
    ``,
    `---`,
    ``,
  ];

  for (const writeup of writeups) {
    const url = writeupUrl(writeup);
    lines.push(`## [${writeup.title}](${url})`);
    lines.push(``);
    lines.push(`**Category:** ${writeup.category} | **Status:** ${writeup.status} | **Date:** ${writeup.date}`);
    if (writeup.tags.length > 0) {
      lines.push(`**Tags:** ${writeup.tags.join(', ')}`);
    }
    lines.push(``);
    lines.push(writeup.summary);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  const markdown = lines.join('\n');
  const filename = `writeups-export-${today}.md`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
