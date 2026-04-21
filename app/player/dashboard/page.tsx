import Link from "next/link";

import InviteInbox from "@/components/InviteInbox";
import Avatar from "@/components/Avatar";
import { requireCurrentUser } from "@/lib/auth";
import { findTeamById, findUserById, listInvitesForPlayer, listReportsForPlayer } from "@/lib/db";

export default async function PlayerDashboardPage() {
  const user = await requireCurrentUser(["player"]);
  const [team, invites, reports] = await Promise.all([
    user.teamId ? findTeamById(user.teamId) : null,
    listInvitesForPlayer(user.id),
    listReportsForPlayer(user.id)
  ]);
  const enrichedInvites = await Promise.all(
    invites.map(async (invite) => {
      const inviteTeam = await findTeamById(invite.teamId);
      const coach = await findUserById(invite.coachUserId);

      return {
        id: invite.id,
        teamName: inviteTeam?.name || "Coach Team",
        coachName: coach?.name || "Assigned coach",
        status: invite.status,
        createdAt: invite.createdAt
      };
    })
  );

  return (
    <section className="space-y-8 py-6">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <span className="eyebrow">Player dashboard</span>
          <div className="flex items-center gap-4">
            <Avatar imageData={user.profileImageData} name={user.name} size="lg" />
            <div>
              <h1 className="section-title">{user.name}</h1>
              <p className="section-copy">
                {team ? `Currently assigned to ${team.name}.` : "You are not assigned to a team yet."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-primary" href="/upload">
              Submit Injury Report
            </Link>
            <Link className="btn-secondary" href="/profile">
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current Team</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{team?.name || "Unassigned"}</p>
          </div>
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pending Invites</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {invites.filter((invite) => invite.status === "pending").length}
            </p>
          </div>
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Reports Submitted</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{reports.length}</p>
          </div>
        </div>
      </div>

      <InviteInbox invites={enrichedInvites} />

      <div className="panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Recent reports</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Your latest submissions</h2>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
              No injury reports yet. Your first submission will show up here.
            </div>
          ) : (
            reports.slice(0, 6).map((report) => (
              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4" key={report.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{report.injuryTitle}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {report.bodyArea} · {report.analysis.severity} · Pain {report.painLevel}/10
                    </p>
                  </div>
                  <Link className="btn-secondary" href={`/result?id=${report.id}`}>
                    Open
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
