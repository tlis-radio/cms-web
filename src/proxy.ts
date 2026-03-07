import { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

// 1. Setup the i18n logic
const handleI18nRouting = createIntlMiddleware({
  locales: ['sk', 'en', 'de', 'es', 'uk', 'tpi'],
  defaultLocale: 'sk',
  localePrefix: 'as-needed',
  localeDetection: false
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Run i18n routing FIRST to get the response object
  const response = handleI18nRouting(request);

  // 3. If it's an embedded path, add your headers to THAT specific response
  if (pathname.includes('/embedded')) {
    response.headers.delete('X-Frame-Options');
    response.headers.set('Content-Security-Policy', "frame-ancestors *");
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all localized paths & the root
    '/', 
    '/(sk|en|de|es|uk|tpi)/:path*',
    // Exclude internal Next.js paths and static files
    '/((?!api|_next/static|_next/image|favicon.ico|images|scripts|embed).*)'
  ],
};