import type { AnalysisResult } from "@/lib/db";

type ResultCardProps = {
  injuryImageData: string;
  extraImages: string[];
  result: AnalysisResult;
  createdAt: string;
  injuryTitle: string;
  bodyArea: string;
  painLevel: number;
  notes: string;
  playerName?: string;
};

export default function ResultCard({
  injuryImageData,
  extraImages,
  result,
  createdAt,
  injuryTitle,
  bodyArea,
  painLevel,
  notes,
  playerName
}: ResultCardProps) {
  const confidencePercentage = Math.round(result.confidence * 100);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="panel overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <p className="text-sm font-semibold text-slate-950">Primary injury image</p>
            <p className="mt-1 text-sm text-slate-500">Submitted {new Date(createdAt).toLocaleString()}</p>
          </div>
          <div className="bg-slate-950/95 p-4 sm:p-6">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-900">
              <img alt="Submitted injury" className="w-full object-cover" src={injuryImageData} />
            </div>
          </div>
        </div>

        {extraImages.length > 0 ? (
          <div className="panel p-6">
            <p className="text-sm font-semibold text-slate-950">Supporting images</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {extraImages.map((image, index) => (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white" key={index}>
                  <img alt={`Supporting view ${index + 1}`} className="h-48 w-full object-cover" src={image} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">AI analysis output</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{injuryTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {playerName ? `${playerName} · ` : ""}{bodyArea} · Pain {painLevel}/10
            </p>
          </div>
          <div className="rounded-[22px] border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Confidence</p>
            <p className="mt-2 text-2xl font-semibold text-blue-900">{confidencePercentage}%</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Injury type</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">{result.injury_type}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Severity</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">{result.severity}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-5 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Healing window</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">{result.healing_time}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Player notes</p>
          <div className="mt-3 rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700">
            {notes || "No extra notes were added to this report."}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Suggested next steps</p>
          <div className="mt-4 space-y-3">
            {result.suggestions.map((suggestion, index) => (
              <div className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-4" key={`${suggestion}-${index}`}>
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
