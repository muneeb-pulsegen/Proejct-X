import Link from "next/link";

const workflow = [
  {
    title: "Secure patient entry",
    body: "Minimal sign-in keeps access gated without slowing down the first-use flow."
  },
  {
    title: "Guided image upload",
    body: "Users preview the wound image before analysis so the submission feels confident and clear."
  },
  {
    title: "Structured AI summary",
    body: "The result returns wound type, severity, expected healing window, and next-step suggestions."
  }
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-20 pb-10 pt-4 sm:gap-24">
      <section className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <span className="eyebrow">AI-assisted wound intake</span>
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              InjuryX
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Triage wound photos with a calm, structured first read.
            </h1>
            <p className="section-copy">
              InjuryX is a lightweight clinical MVP for image-based wound analysis. Users can sign
              in, upload a photo, and receive a clean AI summary in seconds, with the infrastructure
              already set up for secure auth and persistent storage.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-primary" href="/upload">
              Start Analysis
            </Link>
            <Link className="btn-secondary" href="/signup">
              Create Account
            </Link>
            <Link className="btn-secondary" href="/login">
              Login
            </Link>
          </div>
          <div className="grid gap-5 border-t border-slate-200/80 pt-6 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Auth
              </p>
              <p className="mt-2 leading-6">JWT in HTTP-only cookies with protected routes.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Analysis
              </p>
              <p className="mt-2 leading-6">Mock AI results today, Gemini-ready later if needed.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Storage
              </p>
              <p className="mt-2 leading-6">MongoDB when configured, in-memory fallback otherwise.</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[560px]">
          <div className="absolute right-6 top-2 h-40 w-40 rounded-full bg-sky-200/60 blur-3xl" />
          <div className="absolute bottom-12 left-0 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="panel relative flex h-full min-h-[560px] flex-col overflow-hidden p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                  Live demo surface
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  Analysis dashboard preview
                </h2>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Secure session
              </div>
            </div>

            <div className="mt-8 grid flex-1 gap-5">
              <div className="rounded-[24px] border border-blue-100 bg-slate-950 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-blue-200">
                      Latest classification
                    </p>
                    <p className="mt-3 text-3xl font-semibold">Diabetic Ulcer</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
                      Moderate severity with a healing window estimated at two to four weeks.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100">
                    87% confidence
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">Workflow snapshot</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">3 steps</p>
                  </div>
                  <div className="space-y-4">
                    {workflow.map((item, index) => (
                      <div
                        className="grid gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[48px_1fr]"
                        key={item.title}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-semibold text-blue-700">
                          0{index + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/92 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Care guidance
                  </p>
                  <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
                    <li className="border-b border-slate-100 pb-4">
                      Clean the wound gently and redress it daily.
                    </li>
                    <li className="border-b border-slate-100 pb-4">
                      Monitor for redness spread, odor, and rising warmth.
                    </li>
                    <li>Escalate to an in-person clinician if symptoms worsen.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-12 border-t border-slate-200/80 pt-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="space-y-4">
          <span className="eyebrow">Built for a first release</span>
          <h2 className="section-title">
            Clean enough for demo day, sturdy enough to keep growing.
          </h2>
          <p className="section-copy">
            The MVP keeps the moving parts understandable: simple credentials, cookie-based auth,
            one upload flow, one results surface, and backend routes that can grow into a real
            clinical pipeline without a rewrite.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Product shape
            </p>
            <p className="text-xl font-semibold text-slate-950">Landing, auth, upload, result.</p>
            <p className="text-sm leading-7 text-slate-600">
              No dead-end pages, no placeholder labyrinth, just the core experience wired
              end-to-end.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Backend shape
            </p>
            <p className="text-xl font-semibold text-slate-950">
              API routes with JWT, bcrypt-compatible hashing, and persistence helpers.
            </p>
            <p className="text-sm leading-7 text-slate-600">
              MongoDB is supported out of the box, but local development still works without it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
