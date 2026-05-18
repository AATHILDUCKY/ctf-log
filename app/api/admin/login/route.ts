import { NextRequest, NextResponse } from 'next/server';
import { authCookieName, authExpiresInSeconds, signAdminToken, verifyAdminCredentials } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim() ?? '';
    const password = body.password ?? '';

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const token = await signAdminToken(username);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: authCookieName(),
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: authExpiresInSeconds(),
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed.' }, { status: 400 });
  }
}
