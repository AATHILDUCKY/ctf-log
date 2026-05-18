import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ filename: string }>;
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'writeups');

export async function GET(_request: NextRequest, context: RouteContext) {
  const { filename } = await context.params;

  if (!/^[a-f0-9-]+\.webp$/i.test(filename)) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const image = await fs.readFile(path.join(uploadDir, filename));
    return new NextResponse(new Uint8Array(image), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
