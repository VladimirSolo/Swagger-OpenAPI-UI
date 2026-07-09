import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { isProtectedPath } from './lib/auth/protected-paths';
import { SESSION_COOKIE_NAME, verifySessionCookie } from './lib/auth/session';

const handleIntl = createMiddleware(routing);

function splitLocale(pathname: string): { locale: string; rest: string } {
  const matchedLocale = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!matchedLocale) {
    return { locale: routing.defaultLocale, rest: pathname };
  }

  const rest = pathname.slice(`/${matchedLocale}`.length) || '/';
  return { locale: matchedLocale, rest };
}

export async function proxy(request: NextRequest) {
  const { locale, rest } = splitLocale(request.nextUrl.pathname);

  if (isProtectedPath(rest)) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionCookie(sessionCookie);

    if (!session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}`;
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return handleIntl(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
