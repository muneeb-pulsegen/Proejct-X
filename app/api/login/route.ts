import { NextRequest, NextResponse } from "next/server";

import {
  comparePassword,
  setAuthCookie,
  signAuthToken,
  validateEmailFormat
} from "@/lib/auth";
import { findUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!validateEmailFormat(email) || typeof password !== "string") {
      return NextResponse.json({ error: "Please provide a valid email and password." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = signAuthToken({ sub: user.id, email: user.email });
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      }
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
