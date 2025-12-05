import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for the embedded route
  if (request.nextUrl.pathname.startsWith('/embedded')) {
    const response = NextResponse.next();
    
    // Allow embedding in iframes from any origin
    // Note: This is intentionally permissive to allow third-party websites to embed
    // the radio player widgets. The embedded content only serves read-only audio playback
    // and does not expose sensitive user data or authentication tokens.
    response.headers.delete('X-Frame-Options');
    response.headers.set('Content-Security-Policy', "frame-ancestors *");
    
    // Add CORS headers to allow cross-origin requests for embed widgets
    // This enables the widgets to be loaded from any domain that wants to embed the radio player
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/embedded/:path*',
};
