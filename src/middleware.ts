import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

const handleI18nRouting = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = handleI18nRouting(request);

  // next-intl presmerúva URL bez prefixu (/relacie/x -> /sk/relacie/x) cez 307,
  // takže Google indexuje obe verzie. Trvalé 301 zlúči ranking na /sk.
  const location = response.headers.get('location');
  if (response.status === 307 && location) {
    response = NextResponse.redirect(location, 301);
  }

  if (pathname.includes('/embed')) {
    response.headers.delete('X-Frame-Options');
    response.headers.set('Content-Security-Policy', "frame-ancestors *");
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  return response;
}

export const config = {
  matcher: [
    '/', 
    '/(sk|en|de|es|uk|tpi)/:path*',
    '/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)'
  ],
};