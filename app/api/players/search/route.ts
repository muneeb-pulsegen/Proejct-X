import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { listInvitesForCoach, searchEligiblePlayers } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (user.role !== "coach") {
    return NextResponse.json({ error: "Only coaches can search players." }, { status: 403 });
  }

  const query = request.nextUrl.searchParams.get("q") || "";
  const players = await searchEligiblePlayers(query);
  const invites = await listInvitesForCoach(user.id);
  const pendingPlayerIds = new Set(
    invites.filter((invite) => invite.status === "pending").map((invite) => invite.playerUserId)
  );

  return NextResponse.json({
    players: players
      .filter((player) => !pendingPlayerIds.has(player.id))
      .map((player) => ({
        id: player.id,
        name: player.name,
        email: player.email,
        profileImageData: player.profileImageData
      }))
  });
}
