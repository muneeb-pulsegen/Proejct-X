import type { AnalysisResult, InjuryReportRecord, Severity, TeamRecord, UserRecord } from "@/lib/db";

const MOCK_ANALYSES: AnalysisResult[] = [
  {
    injury_type: "Ankle Sprain",
    severity: "Moderate",
    healing_time: "2-4 weeks",
    confidence: 0.87,
    suggestions: ["Limit load for 48 hours", "Use compression support", "Monitor swelling and mobility"]
  },
  {
    injury_type: "Muscle Strain",
    severity: "Mild",
    healing_time: "1-2 weeks",
    confidence: 0.81,
    suggestions: ["Reduce training intensity", "Begin light mobility work", "Track discomfort after sessions"]
  },
  {
    injury_type: "Impact Contusion",
    severity: "Moderate",
    healing_time: "3-6 weeks",
    confidence: 0.84,
    suggestions: ["Ice after activity", "Monitor tenderness", "Adjust load until symptoms settle"]
  },
  {
    injury_type: "Joint Instability",
    severity: "Severe",
    healing_time: "4-8 weeks",
    confidence: 0.79,
    suggestions: ["Escalate for medical review", "Restrict return to play", "Track pain, swelling, and stability"]
  }
];

export function isAllowedImage(imageData: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,/.test(imageData);
}

export function createMockAnalysis(input: {
  injuryImageData: string;
  bodyArea: string;
  painLevel: number;
  notes: string;
  injuryTitle: string;
}) {
  const seed = `${input.injuryImageData}${input.bodyArea}${input.painLevel}${input.notes}${input.injuryTitle}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 29) {
    hash = (hash + seed.charCodeAt(index) * (index + 17)) % 100000;
  }

  const base = MOCK_ANALYSES[hash % MOCK_ANALYSES.length];
  const painWeight = input.painLevel >= 8 ? 2 : input.painLevel >= 5 ? 1 : 0;
  const severities: Severity[] = ["Mild", "Moderate", "Severe"];
  const severityIndex = Math.min(
    severities.length - 1,
    Math.max(severities.indexOf(base.severity), 0) + painWeight
  );

  return {
    ...base,
    severity: severities[severityIndex],
    confidence: Math.min(0.97, Number((base.confidence + input.painLevel / 100).toFixed(2)))
  } satisfies AnalysisResult;
}

export type DashboardStat = {
  key: string;
  label: string;
  value: string;
  info: string;
};

export type DashboardFlag = {
  playerId: string;
  playerName: string;
  reason: string;
  severity: Severity;
  reportId: string;
};

export type DashboardInsight = {
  title: string;
  body: string;
};

export type DashboardRecentReport = {
  reportId: string;
  playerId: string;
  playerName: string;
  injuryTitle: string;
  bodyArea: string;
  severity: Severity;
  painLevel: number;
  createdAt: string;
};

export type DashboardPayload = {
  headlineStats: DashboardStat[];
  severityBreakdown: { label: string; value: number }[];
  healingWindowSummary: { label: string; value: number }[];
  attentionFlags: DashboardFlag[];
  insights: DashboardInsight[];
  recentReports: DashboardRecentReport[];
};

const METRIC_EXPLANATIONS: Record<string, string> = {
  active_players: "How many players are currently attached to the coach's team.",
  injury_reports: "The total number of submitted injury reports linked to this team.",
  reports_last_7_days: "How many new reports were submitted in the last seven days.",
  average_pain: "The mean self-reported pain level across all current team reports.",
  common_body_area: "The body area that appears most often across submitted reports.",
  flagged_players: "Players whose recent reports suggest higher monitoring priority."
};

function parseHealingBucket(healingTime: string) {
  const normalized = healingTime.toLowerCase();

  if (normalized.includes("1-2")) {
    return "1-2 weeks";
  }

  if (normalized.includes("2-4")) {
    return "2-4 weeks";
  }

  if (normalized.includes("3-6")) {
    return "3-6 weeks";
  }

  if (normalized.includes("4-8")) {
    return "4-8 weeks";
  }

  return "Other";
}

function getSeverityValue(severity: Severity) {
  if (severity === "Severe") {
    return 3;
  }

  if (severity === "Moderate") {
    return 2;
  }

  return 1;
}

function buildFallbackInsights(
  reports: InjuryReportRecord[],
  flags: DashboardFlag[],
  mostCommonArea: string
) {
  const severeCount = reports.filter((report) => report.analysis.severity === "Severe").length;
  const averagePain =
    reports.length > 0
      ? (reports.reduce((sum, report) => sum + report.painLevel, 0) / reports.length).toFixed(1)
      : "0.0";

  return [
    {
      title: "Team trend",
      body:
        reports.length > 0
          ? `Most reports are clustering around ${mostCommonArea}, with an average pain level of ${averagePain}.`
          : "No reports yet, so this dashboard is ready to fill in once players start submitting injuries."
    },
    {
      title: "Escalation watch",
      body:
        severeCount > 0
          ? `${severeCount} report(s) are marked severe and should be triaged first.`
          : "No reports are currently marked severe."
    },
    {
      title: "Follow-up pressure",
      body:
        flags.length > 0
          ? `${flags.length} player(s) have signals that suggest closer follow-up.`
          : "No players are currently flagged for closer attention."
    }
  ];
}

export function buildDashboardFallback({
  team,
  players,
  reports
}: {
  team: TeamRecord;
  players: UserRecord[];
  reports: InjuryReportRecord[];
}): DashboardPayload {
  const now = Date.now();
  const reportsLast7Days = reports.filter(
    (report) => now - new Date(report.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
  );
  const bodyAreaCounts = new Map<string, number>();
  const severityCounts = new Map<Severity, number>([
    ["Mild", 0],
    ["Moderate", 0],
    ["Severe", 0]
  ]);
  const healingCounts = new Map<string, number>();
  const recentCountByPlayer = new Map<string, number>();

  reports.forEach((report) => {
    bodyAreaCounts.set(report.bodyArea, (bodyAreaCounts.get(report.bodyArea) || 0) + 1);
    severityCounts.set(
      report.analysis.severity,
      (severityCounts.get(report.analysis.severity) || 0) + 1
    );
    const bucket = parseHealingBucket(report.analysis.healing_time);
    healingCounts.set(bucket, (healingCounts.get(bucket) || 0) + 1);
    if (now - new Date(report.createdAt).getTime() <= 14 * 24 * 60 * 60 * 1000) {
      recentCountByPlayer.set(
        report.playerUserId,
        (recentCountByPlayer.get(report.playerUserId) || 0) + 1
      );
    }
  });

  const averagePain =
    reports.length > 0
      ? (reports.reduce((sum, report) => sum + report.painLevel, 0) / reports.length).toFixed(1)
      : "0.0";

  const mostCommonArea =
    [...bodyAreaCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "No data";

  const playersById = new Map(players.map((player) => [player.id, player]));
  const attentionFlags = reports
    .filter((report) => {
      const healingBucket = parseHealingBucket(report.analysis.healing_time);
      return (
        getSeverityValue(report.analysis.severity) >= 2 ||
        report.painLevel >= 7 ||
        healingBucket === "4-8 weeks" ||
        (recentCountByPlayer.get(report.playerUserId) || 0) >= 2
      );
    })
    .slice(0, 5)
    .map((report) => ({
      playerId: report.playerUserId,
      playerName: playersById.get(report.playerUserId)?.name || "Unknown player",
      reason:
        report.painLevel >= 7
          ? `Pain level ${report.painLevel}/10 and ${report.analysis.severity.toLowerCase()} severity.`
          : `${report.analysis.severity} severity with ${report.analysis.healing_time} projected healing.`,
      severity: report.analysis.severity,
      reportId: report.id
    }));

  return {
    headlineStats: [
      {
        key: "active_players",
        label: "Active Players",
        value: String(players.length),
        info: METRIC_EXPLANATIONS.active_players
      },
      {
        key: "injury_reports",
        label: "Injury Reports",
        value: String(reports.length),
        info: METRIC_EXPLANATIONS.injury_reports
      },
      {
        key: "reports_last_7_days",
        label: "New in 7 Days",
        value: String(reportsLast7Days.length),
        info: METRIC_EXPLANATIONS.reports_last_7_days
      },
      {
        key: "average_pain",
        label: "Average Pain",
        value: averagePain,
        info: METRIC_EXPLANATIONS.average_pain
      },
      {
        key: "common_body_area",
        label: "Most Common Area",
        value: mostCommonArea,
        info: METRIC_EXPLANATIONS.common_body_area
      },
      {
        key: "flagged_players",
        label: "Needs Attention",
        value: String(attentionFlags.length),
        info: METRIC_EXPLANATIONS.flagged_players
      }
    ],
    severityBreakdown: [
      { label: "Mild", value: severityCounts.get("Mild") || 0 },
      { label: "Moderate", value: severityCounts.get("Moderate") || 0 },
      { label: "Severe", value: severityCounts.get("Severe") || 0 }
    ],
    healingWindowSummary: [...healingCounts.entries()].map(([label, value]) => ({ label, value })),
    attentionFlags,
    insights: buildFallbackInsights(reports, attentionFlags, mostCommonArea),
    recentReports: reports.slice(0, 6).map((report) => ({
      reportId: report.id,
      playerId: report.playerUserId,
      playerName: playersById.get(report.playerUserId)?.name || "Unknown player",
      injuryTitle: report.injuryTitle,
      bodyArea: report.bodyArea,
      severity: report.analysis.severity,
      painLevel: report.painLevel,
      createdAt: report.createdAt
    }))
  };
}

export async function buildCoachDashboard({
  team,
  players,
  reports
}: {
  team: TeamRecord;
  players: UserRecord[];
  reports: InjuryReportRecord[];
}) {
  return buildDashboardFallback({ team, players, reports });
}
