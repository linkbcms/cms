import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wRef = searchParams.get('w_ref');

  if (wRef) {
    console.log('wRef', wRef);
    const response = NextResponse.next();
    response.cookies.set({
      name: 'w_ref',
      value: wRef,
      // 30 days
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
