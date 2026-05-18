import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/db/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ settings: getSiteSettings() });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { siteName?: string; challengeTracks?: string[]; logoUrl?: string | null; logoSize?: number | null };
    const settings = updateSiteSettings({
      siteName: body.siteName,
      challengeTracks: body.challengeTracks,
      logoUrl: body.logoUrl,
      logoSize: body.logoSize,
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update settings.' }, { status: 400 });
  }
}
