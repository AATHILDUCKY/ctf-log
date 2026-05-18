import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { saveOptimizedWriteupImage } from '@/lib/imageWriteups';

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
      return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    const image = await saveOptimizedWriteupImage(imageFile);
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to upload image.' }, { status: 400 });
  }
}
