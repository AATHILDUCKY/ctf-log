import { NextResponse } from 'next/server';
import { getPublicWriteupStats } from '@/lib/db/writeups';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getPublicWriteupStats());
}
