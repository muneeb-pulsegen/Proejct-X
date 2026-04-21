import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentUser,
  sessionFromUser,
  setAuthCookie,
  signAuthToken
} from "@/lib/auth";
import {
  assignUserToTeam,
  findInviteById,
  findUserById,
  markOtherPendingInvitesDeclined,
  respondToInvite
} from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (user.role !== "player") {
    return NextResponse.json({ error: "Only players can respond to invites." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { action } = await request.json();

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json({ error: "Invalid invite action." }, { status: 400 });
    }

    const invite = await findInviteById(id);

    if (!invite || invite.playerUserId !== user.id) {
      return NextResponse.json({ error: "Invite not found." }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "This invite has already been handled." }, { status: 409 });
    }

    if (action === "decline") {
      const declinedInvite = await respondToInvite({ inviteId: id, status: "declined" });
      return NextResponse.json({ invite: declinedInvite });
    }

    if (user.teamId) {
      return NextResponse.json({ error: "You already belong to a team." }, { status: 409 });
    }

    await respondToInvite({ inviteId: id, status: "accepted" });
    const updatedUser = await assignUserToTeam(user.id, invite.teamId);

    if (!updatedUser) {
      return NextResponse.json({ error: "Unable to join the team." }, { status: 500 });
    }

    await markOtherPendingInvitesDeclined(user.id, id);
    const refreshedUser = (await findUserById(updatedUser.id)) || updatedUser;
    const response = NextResponse.json({ inviteId: id, teamId: invite.teamId, user: refreshedUser });
    setAuthCookie(response, signAuthToken(sessionFromUser(refreshedUser)));
    return response;
  } catch (error) {
    console.error("Invite response failed", error);
    return NextResponse.json({ error: "Unable to update invite." }, { status: 500 });
  }
}
