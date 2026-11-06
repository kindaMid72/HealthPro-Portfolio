import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Path /en atau diawali /en/ diteruskan apa adanya
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return NextResponse.next();
  }

  // Path /id atau diawali /id/ diredirect 308 permanen ke versi tanpa prefiks (Indonesian canonical)
  if (pathname === '/id' || pathname.startsWith('/id/')) {
    const stripped = pathname === '/id' ? '/' : pathname.slice(3);
    const redirectUrl = new URL(`${stripped}${search}`, request.url);
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Path publik lainnya di-rewrite internal ke /id...
  const rewriteUrl = new URL(`/id${pathname === '/' ? '' : pathname}${search}`, request.url);
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!(?:api|admin|media|_next)(?:/|$)|.*\\..*).*)'],
};
