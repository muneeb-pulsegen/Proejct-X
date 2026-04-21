import TeamManager from "@/components/TeamManager";
import Avatar from "@/components/Avatar";
import { requireCurrentUser } from "@/lib/auth";
import { findTeamByCoachUserId, findUserById, listInvitesForCoach, listTeamMembers } from "@/lib/db";

export default async function CoachTeamPage() {
  const user = await requireCurrentUser(["coach"]);
  const team = await findTeamByCoachUserId(user.id);

  if (!team) {
    return null;
  }

  const [members, invites] = await Promise.all([listTeamMembers(team.id), listInvitesForCoach(user.id)]);
  const enrichedInvites = await Promise.all(
    invites.map(async (invite) => {
      const player = await findUserById(invite.playerUserId);

      return {
        id: invite.id,
        playerName: player?.name || "Invited player",
        status: invite.status,
        createdAt: invite.createdAt
      };
    })
  );

  return (
    <section className="space-y-8 py-6">
      <div className="space-y-4">
        <span className="eyebrow">Team management</span>
        <h1 className="section-title">{team.name}</h1>
        <p className="section-copy">
          Invite existing player accounts, monitor pending team requests, and keep a clear view of the current roster.
        </p>
      </div>

      <div className="panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Current roster</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{members.length} player(s)</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.length === 0 ? (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
              No players are on this team yet.
            </div>
          ) : (
            members.map((member) => (
              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4" key={member.id}>
                <div className="flex items-center gap-4">
                  <Avatar imageData={member.profileImageData} name={member.name} />
                  <div>
                    <p className="font-semibold text-slate-950">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TeamManager
        initialInvites={enrichedInvites}
        initialPlayers={[]}
      />
    </section>
  );
}
