import { NextRequest, NextResponse } from 'next/server';
import { authCookieName, verifyAdminToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(authCookieName())?.value;
  const isAuthenticated = token ? await verifyAdminToken(token) : false;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (pathname !== '/admin/login' && !isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
