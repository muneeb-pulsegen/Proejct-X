import { NextRequest, NextResponse } from "next/server";

import {
  isPasswordStrongEnough,
  setAuthCookie,
  signAuthToken,
  validateEmailFormat,
  hashPassword
} from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!validateEmailFormat(email) || typeof password !== "string") {
      return NextResponse.json({ error: "Please provide a valid email and password." }, { status: 400 });
    }

    if (!isPasswordStrongEnough(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ email: normalizedEmail, passwordHash });
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
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    console.error("Signup failed", error);
    return NextResponse.json({ error: "Unable to create account right now." }, { status: 500 });
  }
}
