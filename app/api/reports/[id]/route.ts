import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { findReportById, findUserById } from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;
  const report = await findReportById(id);

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const player = await findUserById(report.playerUserId);
  const canView =
    user.role === "player"
      ? report.playerUserId === user.id
      : Boolean(player?.teamId && player.teamId === user.teamId);

  if (!canView) {
    return NextResponse.json({ error: "You do not have access to this report." }, { status: 403 });
  }

  return NextResponse.json({ report, player });
}
