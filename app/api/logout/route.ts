import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") || "/login";
  const response = NextResponse.redirect(new URL(next, request.url));
  clearAuthCookie(response);
  return response;
}
