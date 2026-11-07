import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Paths /en or starting with /en/ are passed through as-is
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return NextResponse.next();
  }

  // Paths /id or starting with /id/ are permanently redirected (308) to the unprefixed version (Indonesian canonical)
  if (pathname === '/id' || pathname.startsWith('/id/')) {
    const stripped = pathname === '/id' ? '/' : pathname.slice(3);
    const redirectUrl = new URL(`${stripped}${search}`, request.url);
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Other public paths are rewritten internally to /id...
  const rewriteUrl = new URL(`/id${pathname === '/' ? '' : pathname}${search}`, request.url);
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!(?:api|admin|media|_next)(?:/|$)|.*\\..*).*)'],
};
