import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { findTeamByCoachUserId, findTeamById } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const team =
    user.role === "coach"
      ? await findTeamByCoachUserId(user.id)
      : user.teamId
        ? await findTeamById(user.teamId)
        : null;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      profileImageData: user.profileImageData,
      teamId: team?.id || user.teamId
    },
    team
  });
}
