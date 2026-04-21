import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const AUTH_COOKIE_NAME = "injuryx_token";
const AUTH_PAGES = new Set(["/login", "/signup"]);
const SHARED_AUTH_PREFIXES = ["/profile", "/result"];
const PLAYER_PREFIXES = ["/upload", "/player"];
const COACH_PREFIXES = ["/coach"];
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "injuryx-dev-secret-change-me"
);

type SessionPayload = {
  sub: string;
  email: string;
  role: "player" | "coach";
  teamId: string | null;
};

function getRoleHomePath(role: SessionPayload["role"]) {
  return role === "coach" ? "/coach/dashboard" : "/player/dashboard";
}

async function getSession(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"]
    });

    return verified.payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;
  const session = token ? await getSession(token) : null;
  const isAuthPage = AUTH_PAGES.has(pathname);
  const needsSharedAuth = SHARED_AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isPlayerRoute = PLAYER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isCoachRoute = COACH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if ((needsSharedAuth || isPlayerRoute || isCoachRoute) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPlayerRoute && session?.role !== "player") {
    return NextResponse.redirect(new URL(getRoleHomePath(session!.role), request.url));
  }

  if (isCoachRoute && session?.role !== "coach") {
    return NextResponse.redirect(new URL(getRoleHomePath(session!.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/profile/:path*", "/player/:path*", "/coach/:path*", "/upload/:path*", "/result/:path*"]
};
