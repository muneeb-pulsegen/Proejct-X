"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { DashboardPayload } from "@/lib/analysis";

const SEVERITY_COLORS = {
  Mild: "#10b981",
  Moderate: "#f59e0b",
  Severe: "#ef4444"
} as const;

const HEALING_COLORS = ["#0f172a", "#2563eb", "#38bdf8", "#94a3b8", "#cbd5e1"];

export default function CoachDashboardCharts({
  dashboard
}: {
  dashboard: DashboardPayload;
}) {
  const severityData = dashboard.severityBreakdown.filter((item) => item.value > 0);
  const healingData = dashboard.healingWindowSummary.filter((item) => item.value > 0);
  const bodyAreaData = dashboard.bodyAreaDistribution.filter((item) => item.value > 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="grid gap-8">
        <div className="panel p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pain trend
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Average reported pain over the last seven days across team submissions.
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={dashboard.painTrend}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={10} />
                <YAxis
                  axisLine={false}
                  domain={[0, 10]}
                  tickLine={false}
                  tickMargin={10}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#e2e8f0",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)"
                  }}
                />
                <Line
                  dataKey="value"
                  dot={{ fill: "#2563eb", r: 4 }}
                  stroke="#2563eb"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Body area distribution
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The most common body regions appearing in current team reports.
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={bodyAreaData} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid stroke="#eef2f7" horizontal={false} />
                <XAxis allowDecimals={false} axisLine={false} tickLine={false} type="number" />
                <YAxis
                  axisLine={false}
                  dataKey="label"
                  tickLine={false}
                  type="category"
                  width={96}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#e2e8f0",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)"
                  }}
                />
                <Bar dataKey="value" fill="#0f172a" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <div className="panel p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Severity mix
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Current spread of mild, moderate, and severe injury outcomes.
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={severityData}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={96}
                  paddingAngle={4}
                >
                  {severityData.map((entry) => (
                    <Cell
                      fill={SEVERITY_COLORS[entry.label as keyof typeof SEVERITY_COLORS] || "#94a3b8"}
                      key={entry.label}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#e2e8f0",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {dashboard.severityBreakdown.map((item) => (
              <div className="rounded-[22px] bg-slate-50 px-4 py-3" key={item.label}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Healing windows
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Projected recovery windows grouped from the current report set.
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={healingData}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#e2e8f0",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)"
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {healingData.map((entry, index) => (
                    <Cell fill={HEALING_COLORS[index % HEALING_COLORS.length]} key={entry.label} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
