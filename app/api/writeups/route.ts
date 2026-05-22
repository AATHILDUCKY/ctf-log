import { NextRequest, NextResponse } from 'next/server';
import { createWriteup, getPublicWriteupStats, listWriteups, queryPublicWriteups } from '@/lib/db/writeups';
import { parseWriteupInput } from '@/lib/writeupValidation';
import { isAdminRequest } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const includePrivate = request.nextUrl.searchParams.get('scope') === 'admin';
  if (includePrivate && !(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!includePrivate) {
    const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
    const pageSize = Number(request.nextUrl.searchParams.get('pageSize') ?? '10');
    const query = request.nextUrl.searchParams.get('q') ?? '';
    const category = request.nextUrl.searchParams.get('category');
    const excludeCategory = request.nextUrl.searchParams.get('excludeCategory') ?? undefined;
    return NextResponse.json({
      ...queryPublicWriteups({ page, pageSize, query, category: category ?? 'All', excludeCategory }),
      stats: getPublicWriteupStats(),
    });
  }

  return NextResponse.json({ writeups: listWriteups({ includePrivate }) });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const input = parseWriteupInput(await request.json());
    const writeup = createWriteup(input);
    return NextResponse.json({ writeup }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create writeup.' }, { status: 400 });
  }
}
