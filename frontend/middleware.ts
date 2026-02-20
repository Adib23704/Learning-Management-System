import { type NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const DASHBOARD_PREFIXES = [
  "/student",
  "/instructor",
  "/admin",
  "/super-admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has("refresh_token");

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (hasRefreshToken) {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.next();
  }

  if (DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!hasRefreshToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/student/:path*",
    "/instructor/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
  ],
};
