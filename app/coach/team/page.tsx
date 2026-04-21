import Avatar from "@/components/Avatar";
import TeamManager from "@/components/TeamManager";
import TeamRoster from "@/components/TeamRoster";
import { requireCurrentUser } from "@/lib/auth";
import { findTeamByCoachUserId, findUserById, listInvitesForCoach, listReportsForTeam, listTeamMembers } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function CoachTeamPage() {
  const user = await requireCurrentUser(["coach"]);
  const team = await findTeamByCoachUserId(user.id);

  if (!team) {
    return null;
  }

  const [members, invites, reports] = await Promise.all([
    listTeamMembers(team.id),
    listInvitesForCoach(user.id),
    listReportsForTeam(team.id)
  ]);
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
  const reportsByPlayer = new Map(
    members.map((member) => {
      const memberReports = reports.filter((report) => report.playerUserId === member.id);
      const averagePain =
        memberReports.length > 0
          ? (
              memberReports.reduce((sum, report) => sum + report.painLevel, 0) /
              memberReports.length
            ).toFixed(1)
          : "0.0";
      const latestReport = memberReports[0];

      return [
        member.id,
        {
          reportCount: memberReports.length,
          averagePain,
          latestReport: latestReport
            ? {
                id: latestReport.id,
                injuryTitle: latestReport.injuryTitle,
                bodyArea: latestReport.bodyArea,
                injuryType: latestReport.analysis.injury_type,
                severity: latestReport.analysis.severity,
                painLevel: latestReport.painLevel,
                createdAt: latestReport.createdAt,
                notes: latestReport.notes
              }
            : null
        }
      ] as const;
    })
  );
  const severeFlags = reports.filter((report) => report.analysis.severity === "Severe").length;
  const pendingInvites = invites.filter((invite) => invite.status === "pending").length;

  return (
    <section className="space-y-10 py-6">
      <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_42%,#eef4ff_100%)] p-7 shadow-[0_24px_100px_rgba(15,23,42,0.08)] sm:p-9">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_56%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar imageData={user.profileImageData} name={user.name} size="lg" />
              <div>
                <span className="eyebrow">Team command</span>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{team.name}</h1>
              </div>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Review the full roster, open any player profile in a modal, and keep invite activity moving without leaving the page.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-white/85">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Roster</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{members.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/85">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pending invites</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{pendingInvites}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/85">
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Severe flags</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{severeFlags}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card className="bg-white/88">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Roster</CardTitle>
            <CardDescription>
              Click any player to open a full detail modal with the latest injury context.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">{members.length} active players</Badge>
            <Badge variant="warning">{pendingInvites} pending invites</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <TeamRoster
            members={members.map((member) => ({
              id: member.id,
              name: member.name,
              email: member.email,
              profileImageData: member.profileImageData,
              reportCount: reportsByPlayer.get(member.id)?.reportCount || 0,
              averagePain: reportsByPlayer.get(member.id)?.averagePain || "0.0",
              latestReport: reportsByPlayer.get(member.id)?.latestReport || null
            }))}
          />
        </CardContent>
      </Card>

      <Separator />

      <TeamManager
        initialInvites={enrichedInvites}
        initialPlayers={[]}
      />
    </section>
  );
}
