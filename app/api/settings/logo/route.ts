import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { saveOptimizedBrandLogo } from '@/lib/imageBrand';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return NextResponse.json({ error: 'Logo file is required.' }, { status: 400 });
    }

    const logo = await saveOptimizedBrandLogo(imageFile);
    return NextResponse.json({ logo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to upload logo.' }, { status: 400 });
  }
}
