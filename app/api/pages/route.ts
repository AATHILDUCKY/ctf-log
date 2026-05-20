import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { isSitePageSlug, listSitePages, updateSitePage } from '@/lib/db/sitePages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ pages: listSitePages() });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = String(body.slug ?? '');
    if (!isSitePageSlug(slug)) {
      return NextResponse.json({ error: 'Unknown page.' }, { status: 400 });
    }

    const page = updateSitePage(slug, {
      title: String(body.title ?? ''),
      summary: String(body.summary ?? ''),
      content: String(body.content ?? ''),
      seoTitle: String(body.seoTitle ?? ''),
      seoDescription: String(body.seoDescription ?? ''),
    });

    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update page.' }, { status: 400 });
  }
}
