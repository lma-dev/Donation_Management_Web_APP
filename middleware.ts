import createIntlMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const publicPages = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];

const PROTECTED_ROUTES: { path: string; minRole: string }[] = [
  { path: "/activity-logs", minRole: "SYSTEM_ADMIN" },
  { path: "/user-management", minRole: "ADMIN" },
  { path: "/donation-place-management", minRole: "ADMIN" },
];

const ROLE_HIERARCHY: Record<string, number> = {
  USER: 0,
  ADMIN: 1,
  SYSTEM_ADMIN: 2,
};

function hasMinRole(userRole: string, requiredRole: string): boolean {
  return (
    (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 999)
  );
}

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

  // Role-based route protection
  const userRole = (token.role as string) ?? "USER";
  for (const route of PROTECTED_ROUTES) {
    if (pathnameWithoutLocale.startsWith(route.path)) {
      if (!hasMinRole(userRole, route.minRole)) {
        const locale =
          pathname.match(/^\/(en|ja|mm)/)?.[1] || routing.defaultLocale;
        return NextResponse.redirect(
          new URL(`/${locale}/dashboard`, req.url),
        );
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
