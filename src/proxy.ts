import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check if the request is for the embedded route
  if (request.nextUrl.pathname.startsWith('/embedded')) {
    const response = NextResponse.next();
    
    // Allow embedding in iframes from any origin
    response.headers.delete('X-Frame-Options');
    response.headers.set('Content-Security-Policy', "frame-ancestors *");
    
    // Add CORS headers to allow cross-origin requests
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
