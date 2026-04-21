import Link from "next/link";
import { Info } from "lucide-react";

import CoachDashboardCharts from "@/components/CoachDashboardCharts";
import type { DashboardPayload } from "@/lib/analysis";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function InfoChip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label="Show metric explanation"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          type="button"
        >
          <Info className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export default function CoachDashboardView({ dashboard }: { dashboard: DashboardPayload }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.headlineStats.map((stat) => (
          <div className="panel p-5" key={stat.key}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
              </div>
              <InfoChip text={stat.info} />
            </div>
          </div>
        ))}
      </div>

      <CoachDashboardCharts dashboard={dashboard} />

      <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Players needing attention</p>
          <div className="mt-6 space-y-4">
            {dashboard.attentionFlags.length === 0 ? (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
                No players are currently flagged.
              </div>
            ) : (
              dashboard.attentionFlags.map((flag) => (
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4" key={flag.reportId}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{flag.playerName}</p>
                      <p className="mt-1 text-sm text-slate-500">{flag.reason}</p>
                    </div>
                    <Link className="btn-secondary" href={`/result?id=${flag.reportId}`}>
                      Open
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Recent reports</p>
          <div className="mt-6 space-y-4">
            {dashboard.recentReports.length === 0 ? (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
                No reports yet. Once players submit injuries, this feed will populate automatically.
              </div>
            ) : (
              dashboard.recentReports.map((report) => (
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4" key={report.reportId}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{report.injuryTitle}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {report.playerName} · {report.bodyArea} · Pain {report.painLevel}/10
                      </p>
                    </div>
                    <Link className="btn-secondary" href={`/result?id=${report.reportId}`}>
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">AI insights</p>
          <div className="mt-6 space-y-4">
            {dashboard.insights.map((insight) => (
              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4" key={insight.title}>
                <p className="font-semibold text-slate-950">{insight.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{insight.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
