import { NextRequest, NextResponse } from "next/server";

import {
  comparePassword,
  sessionFromUser,
  setAuthCookie,
  signAuthToken,
  validateEmailFormat
} from "@/lib/auth";
import { assignUserToTeam, findTeamByCoachUserId, findUserByEmail } from "@/lib/db";

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

    const team = user.role === "coach" ? await findTeamByCoachUserId(user.id) : null;
    const signedInUser =
      user.role === "coach" && team
        ? (user.teamId === team.id ? user : await assignUserToTeam(user.id, team.id)) || {
            ...user,
            teamId: team.id
          }
        : user;
    const response = NextResponse.json({
      user: {
        id: signedInUser.id,
        email: signedInUser.email,
        role: signedInUser.role,
        name: signedInUser.name,
        teamId: signedInUser.teamId
      }
    });

    setAuthCookie(response, signAuthToken(sessionFromUser(signedInUser)));
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
