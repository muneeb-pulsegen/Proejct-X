import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import {
  createInvite,
  findTeamByCoachUserId,
  findTeamById,
  findUserById,
  listInvitesForCoach,
  listInvitesForPlayer
} from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const invites =
    user.role === "coach" ? await listInvitesForCoach(user.id) : await listInvitesForPlayer(user.id);

  const enriched = await Promise.all(
    invites.map(async (invite) => {
      const team = await findTeamById(invite.teamId);
      const player = await findUserById(invite.playerUserId);
      const coach = await findUserById(invite.coachUserId);

      return {
        ...invite,
        teamName: team?.name || "Unknown team",
        playerName: player?.name || "Unknown player",
        coachName: coach?.name || "Unknown coach"
      };
    })
  );

  return NextResponse.json({ invites: enriched });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (user.role !== "coach") {
    return NextResponse.json({ error: "Only coaches can send invites." }, { status: 403 });
  }

  try {
    const { playerUserId } = await request.json();
    const team = await findTeamByCoachUserId(user.id);

    if (!team) {
      return NextResponse.json({ error: "Coach team not found." }, { status: 404 });
    }

    const player = await findUserById(playerUserId);

    if (!player || player.role !== "player") {
      return NextResponse.json({ error: "Player account not found." }, { status: 404 });
    }

    if (player.teamId) {
      return NextResponse.json({ error: "That player is already assigned to a team." }, { status: 409 });
    }

    const pendingInvites = await listInvitesForCoach(user.id);
    const alreadyInvited = pendingInvites.some(
      (invite) => invite.playerUserId === player.id && invite.status === "pending"
    );

    if (alreadyInvited) {
      return NextResponse.json({ error: "That player already has a pending invite." }, { status: 409 });
    }

    const invite = await createInvite({
      teamId: team.id,
      coachUserId: user.id,
      playerUserId: player.id
    });

    return NextResponse.json({ invite });
  } catch (error) {
    console.error("Invite creation failed", error);
    return NextResponse.json({ error: "Unable to create invite." }, { status: 500 });
  }
}
