import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";

import { findUserById, type UserRecord, type UserRole } from "@/lib/db";

export const AUTH_COOKIE_NAME = "injuryx_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  teamId: string | null;
};

function getJwtSecret() {
  return process.env.JWT_SECRET || "injuryx-dev-secret-change-me";
}

export function validateEmailFormat(email: unknown) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isPasswordStrongEnough(password: string) {
  return password.trim().length >= 8;
}

export function validateName(name: unknown) {
  return typeof name === "string" && name.trim().length >= 2;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: AUTH_COOKIE_MAX_AGE
  });
}

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export function sessionFromUser(user: UserRecord): AuthTokenPayload {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    teamId: user.teamId
  };
}

export function getRoleHomePath(role: UserRole) {
  return role === "coach" ? "/coach/dashboard" : "/player/dashboard";
}

export function getAuthPayloadFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();

  if (!session) {
    return null;
  }

  return findUserById(session.sub);
}

export async function requireCurrentUser(allowedRoles?: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/logout?next=/login");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(getRoleHomePath(user.role));
  }

  return user;
}
