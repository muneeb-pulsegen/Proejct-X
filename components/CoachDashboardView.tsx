import Link from "next/link";

import type { DashboardPayload } from "@/lib/analysis";

function InfoChip({ text }: { text: string }) {
  return (
    <details className="group relative">
      <summary className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-500 marker:hidden">
        i
      </summary>
      <div className="absolute right-0 top-10 z-10 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600 shadow-soft">
        {text}
      </div>
    </details>
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

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Severity mix</p>
          <div className="mt-6 space-y-4">
            {dashboard.severityBreakdown.map((item) => (
              <div className="space-y-2" key={item.label}>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${item.label === "Severe" ? "bg-rose-500" : item.label === "Moderate" ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.max(8, item.value * 16)}px` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Healing windows</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {dashboard.healingWindowSummary.map((item) => (
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700" key={item.label}>
                {item.label}: {item.value}
              </div>
            ))}
          </div>
        </div>

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
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
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
