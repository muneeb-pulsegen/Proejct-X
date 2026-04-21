import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const AUTH_COOKIE_NAME = "injuryx_token";
const AUTH_PAGES = new Set(["/login", "/signup"]);
const PROTECTED_PREFIXES = ["/upload", "/result"];
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "injuryx-dev-secret-change-me"
);

async function hasValidSession(token: string) {
  try {
    await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"]
    });

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.has(pathname);
  const isAuthenticated = token ? await hasValidSession(token) : false;

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/upload", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/upload/:path*", "/result/:path*", "/login", "/signup"]
};
