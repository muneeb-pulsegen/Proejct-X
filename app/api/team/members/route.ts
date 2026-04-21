import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { findTeamByCoachUserId, listTeamMembers } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (user.role !== "coach") {
    return NextResponse.json({ error: "Only coaches can view team members." }, { status: 403 });
  }

  const team = await findTeamByCoachUserId(user.id);

  if (!team) {
    return NextResponse.json({ error: "Coach team not found." }, { status: 404 });
  }

  const members = await listTeamMembers(team.id);

  return NextResponse.json({
    team,
    members: members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      profileImageData: member.profileImageData,
      teamId: member.teamId
    }))
  });
}
