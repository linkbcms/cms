import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const MAX_DAYS = 30;

export function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const refId = searchParams.get('ref_id');

  if (refId) {
    const response = NextResponse.next();
    response.cookies.set({
      name: 'ref_id',
      value: refId,
      // 30 days
      maxAge: 60 * 60 * 24 * MAX_DAYS,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
