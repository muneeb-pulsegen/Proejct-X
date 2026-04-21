import { requireCurrentUser } from "@/lib/auth";

import ImageUpload from "@/components/ImageUpload";

export default async function UploadPage() {
  const user = await requireCurrentUser(["player"]);

  return (
    <section className="grid flex-1 gap-12 py-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
      <div className="space-y-6">
        <span className="eyebrow">Protected workspace</span>
        <div className="space-y-4">
          <h1 className="section-title">Upload an injury image for structured analysis.</h1>
          <p className="section-copy">
            {user.teamId
              ? "Your assigned coach will see the report once it's submitted."
              : "You can still submit reports before joining a team, and they will remain attached to your player profile."}
          </p>
        </div>

        <div className="panel p-6">
          <div className="space-y-5 text-sm leading-7 text-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Suggested capture
              </p>
              <p className="mt-2">
                Use even lighting, keep the injury centered, and add notes that help the coach understand context.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Current analysis mode
              </p>
              <p className="mt-2">
                The report analysis is stored immediately and becomes available to any assigned coach.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ImageUpload />
    </section>
  );
}
