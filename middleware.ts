import createIntlMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const publicPages = ["/", "/auth/login", "/auth/register"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const pathnameWithoutLocale = pathname.replace(/^\/(en|ja|mm)/, "") || "/";
  const isPublicPage = publicPages.includes(pathnameWithoutLocale);

  if (isPublicPage) {
    return intlMiddleware(req);
  }

  const token = await getToken({ req });

  if (!token) {
    const locale =
      pathname.match(/^\/(en|ja|mm)/)?.[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
