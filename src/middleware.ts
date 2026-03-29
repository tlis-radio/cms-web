import { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

const handleI18nRouting = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = handleI18nRouting(request);

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
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
};