import { NextResponse } from 'next/server';

export function middleware(request) {
  // Add any authentication checks here if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Add routes that need authentication
    '/add-entry/:path*',
    '/entries/:path*',
    '/mood-tracker/:path*',
    '/todolist/:path*',
  ],
};
