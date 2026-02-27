import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { appendToLog } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  await appendToLog(`Middleware triggered for path: ${request.nextUrl.pathname}`);
  const allCookies = request.cookies.getAll().map(c => c.name);
  await appendToLog(`Cookies received: ${JSON.stringify(allCookies)}`);
  const isAuthenticated = request.cookies.has('auth');
  await appendToLog(`Middleware check: isAuthenticated = ${isAuthenticated}`);

  if (!isAuthenticated && request.nextUrl.pathname !== '/login') {
    await appendToLog('User not authenticated, redirecting to /login.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // The following block is removed to prevent the redirect loop.
  // if (isAuthenticated && request.nextUrl.pathname === '/login') {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  await appendToLog('Middleware check passed.');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
};
