import { NextResponse } from "next/server";

import { buildCoachDashboard } from "@/lib/analysis";
import { getCurrentUser } from "@/lib/auth";
import { findTeamByCoachUserId, listReportsForTeam, listTeamMembers } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (user.role !== "coach") {
    return NextResponse.json({ error: "Only coaches can view the dashboard." }, { status: 403 });
  }

  const team = await findTeamByCoachUserId(user.id);

  if (!team) {
    return NextResponse.json({ error: "Coach team not found." }, { status: 404 });
  }

  const [players, reports] = await Promise.all([listTeamMembers(team.id), listReportsForTeam(team.id)]);
  const dashboard = await buildCoachDashboard({ team, players, reports });

  return NextResponse.json({ team, players, reports, dashboard });
}
