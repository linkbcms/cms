import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const refId = searchParams.get('ref_id');

  if (refId) {
    console.log('refId', refId);
    const response = NextResponse.next();
    response.cookies.set({
      name: 'ref_id',
      value: refId,
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
