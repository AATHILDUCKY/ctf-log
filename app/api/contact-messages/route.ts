import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';
import { createContactMessage, getContactMessageStats, listContactMessages } from '@/lib/db/contactMessages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json({ messages: listContactMessages(), stats: getContactMessageStats() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = createContactMessage({
      name: String(body.name ?? ''),
      email: String(body.email ?? ''),
      subject: String(body.subject ?? ''),
      message: String(body.message ?? ''),
    });

    return NextResponse.json({ message: { id: message.id, createdAt: message.createdAt } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to send message.' }, { status: 400 });
  }
}
