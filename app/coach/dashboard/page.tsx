import CoachDashboardView from "@/components/CoachDashboardView";
import { buildCoachDashboard } from "@/lib/analysis";
import { requireCurrentUser } from "@/lib/auth";
import { findTeamByCoachUserId, listReportsForTeam, listTeamMembers } from "@/lib/db";

export default async function CoachDashboardPage() {
  const user = await requireCurrentUser(["coach"]);
  const team = await findTeamByCoachUserId(user.id);

  if (!team) {
    return (
      <section className="py-8">
        <div className="panel max-w-2xl p-8">
          <h1 className="section-title">No team found</h1>
          <p className="mt-4 section-copy">Your coach account should own a team automatically, but we could not find it.</p>
        </div>
      </section>
    );
  }

  const [players, reports] = await Promise.all([listTeamMembers(team.id), listReportsForTeam(team.id)]);
  const dashboard = await buildCoachDashboard({ team, players, reports });

  return (
    <section className="space-y-8 py-6">
      <div className="space-y-4">
        <span className="eyebrow">Coach dashboard</span>
        <h1 className="section-title">{team.name}</h1>
        <p className="section-copy">
          Team-wide injury overview with explainable metrics, flagged players, and AI-assisted observations.
        </p>
      </div>

      <CoachDashboardView dashboard={dashboard} />
    </section>
  );
}
