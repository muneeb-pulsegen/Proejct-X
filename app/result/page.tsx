import Link from "next/link";
import { redirect } from "next/navigation";

import ResultCard from "@/components/ResultCard";
import { requireCurrentUser } from "@/lib/auth";
import { findReportById, findUserById } from "@/lib/db";

type ResultPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const { id } = await searchParams;
  const user = await requireCurrentUser();

  if (!id) {
    redirect(user.role === "coach" ? "/coach/dashboard" : "/upload");
  }

  const report = await findReportById(id);

  if (!report) {
    return (
      <section className="flex flex-1 items-center justify-center py-14">
        <div className="panel max-w-xl p-8 text-center">
          <span className="eyebrow">No result found</span>
          <h1 className="mt-5 text-3xl font-semibold text-slate-950">That injury report could not be loaded.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            The link may be incomplete or the report may not exist in the current storage session.
          </p>
        </div>
      </section>
    );
  }

  const player = await findUserById(report.playerUserId);
  const canView =
    user.role === "player"
      ? report.playerUserId === user.id
      : Boolean(player?.teamId && player.teamId === user.teamId);

  if (!canView) {
    redirect(user.role === "coach" ? "/coach/dashboard" : "/player/dashboard");
  }

  return (
    <section className="py-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="eyebrow">Analysis result</span>
          <h1 className="section-title">Structured injury report ready for review.</h1>
          <p className="section-copy">
            {user.role === "coach"
              ? "You are viewing a player report from your team."
              : "This report stays visible to you and, if assigned, to your coach."}
          </p>
        </div>
        <Link className="btn-secondary" href={user.role === "coach" ? "/coach/dashboard" : "/upload"}>
          {user.role === "coach" ? "Back to dashboard" : "Submit another report"}
        </Link>
      </div>

      <ResultCard
        bodyArea={report.bodyArea}
        createdAt={report.createdAt}
        extraImages={report.extraImages}
        injuryImageData={report.injuryImageData}
        injuryTitle={report.injuryTitle}
        notes={report.notes}
        painLevel={report.painLevel}
        playerName={player?.name}
        result={report.analysis}
      />
    </section>
  );
}
