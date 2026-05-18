import { NextRequest, NextResponse } from 'next/server';
import { createAd, listAds } from '@/lib/db/ads';
import { isAdminRequest } from '@/lib/auth';
import { saveOptimizedAdImage } from '@/lib/imageAds';
import { parseAdInput } from '@/lib/adValidation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json({ ads: listAds() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
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
        imageUrl: formData.get('imageUrl'),
        imageSize: formData.get('imageSize'),
        popupIntervalSeconds: formData.get('popupIntervalSeconds'),
      },
      image,
    );

    const ad = createAd(input);
    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create ad.' }, { status: 400 });
  }
}
