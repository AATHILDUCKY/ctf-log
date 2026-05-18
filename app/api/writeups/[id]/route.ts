import { NextRequest, NextResponse } from 'next/server';
import { deleteWriteup, getWriteup, updateWriteup } from '@/lib/db/writeups';
import { parseWriteupInput } from '@/lib/writeupValidation';
import { isAdminRequest } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  if (!(await isAdminRequest(_request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await context.params;
  const writeup = getWriteup(id, { includePrivate: true });

  if (!writeup) {
    return NextResponse.json({ error: 'Writeup not found.' }, { status: 404 });
  }

  return NextResponse.json({ writeup });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const input = parseWriteupInput(await request.json());
    const writeup = updateWriteup(id, input);

    if (!writeup) {
      return NextResponse.json({ error: 'Writeup not found.' }, { status: 404 });
    }

    return NextResponse.json({ writeup });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update writeup.' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAdminRequest(_request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = deleteWriteup(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Writeup not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
