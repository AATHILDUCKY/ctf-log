import { NextRequest, NextResponse } from 'next/server';
import { deleteAd, getAd, updateAd } from '@/lib/db/ads';
import { isAdminRequest } from '@/lib/auth';
import { saveOptimizedAdImage } from '@/lib/imageAds';
import { parseAdInput } from '@/lib/adValidation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = getAd(id);
  if (!existing) {
    return NextResponse.json({ error: 'Ad not found.' }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const image =
      imageFile instanceof File && imageFile.size > 0
        ? await saveOptimizedAdImage(imageFile)
        : undefined;

    const input = parseAdInput(
      {
        title: formData.get('title'),
        type: formData.get('type'),
        placement: formData.get('placement'),
        status: formData.get('status'),
        linkUrl: formData.get('linkUrl'),
        altText: formData.get('altText'),
        googleCode: formData.get('googleCode'),
        sponsorLabel: formData.get('sponsorLabel'),
        sortOrder: formData.get('sortOrder'),
        imageUrl: formData.get('imageUrl') ?? existing.imageUrl ?? '',
        imageSize: formData.get('imageSize') ?? String(existing.imageSize ?? ''),
        popupIntervalSeconds: formData.get('popupIntervalSeconds') ?? String(existing.popupIntervalSeconds ?? 120),
      },
      image,
    );

    const ad = updateAd(id, input);
    return NextResponse.json({ ad });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update ad.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = deleteAd(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Ad not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
