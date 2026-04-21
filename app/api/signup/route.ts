import { NextRequest, NextResponse } from "next/server";

import {
  hashPassword,
  isPasswordStrongEnough,
  sessionFromUser,
  setAuthCookie,
  signAuthToken,
  validateEmailFormat,
  validateName
} from "@/lib/auth";
import { assignUserToTeam, createTeam, createUser, findUserByEmail, type UserRole } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, name } = await request.json();

    if (!validateEmailFormat(email) || typeof password !== "string" || !validateName(name)) {
      return NextResponse.json(
        { error: "Please provide a valid name, email, and password." },
        { status: 400 }
      );
    }

    if (role !== "player" && role !== "coach") {
      return NextResponse.json({ error: "Please choose a valid account type." }, { status: 400 });
    }

    if (!isPasswordStrongEnough(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const user = await createUser({
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role: role as UserRole,
      name: trimmedName
    });

    let signedInUser = user;
    let team = null;

    if (user.role === "coach") {
      team = await createTeam({
        coachUserId: user.id,
        name: `${trimmedName}'s Team`
      });
      signedInUser = (await assignUserToTeam(user.id, team.id)) || { ...user, teamId: team.id };
    }

    const response = NextResponse.json({
      user: {
        id: signedInUser.id,
        email: signedInUser.email,
        role: signedInUser.role,
        name: signedInUser.name,
        teamId: signedInUser.teamId
      },
      team
    });

    setAuthCookie(response, signAuthToken(sessionFromUser(signedInUser)));
    return response;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    console.error("Signup failed", error);
    return NextResponse.json({ error: "Unable to create account right now." }, { status: 500 });
  }
}
