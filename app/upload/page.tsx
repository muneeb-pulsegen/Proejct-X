import ImageUpload from "@/components/ImageUpload";

export default function UploadPage() {
  return (
    <section className="grid flex-1 gap-12 py-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
      <div className="space-y-6">
        <span className="eyebrow">Protected workspace</span>
        <div className="space-y-4">
          <h1 className="section-title">Upload a wound image for AI-assisted analysis.</h1>
          <p className="section-copy">
            This MVP accepts a single image, previews it before submission, and returns a
            structured response that the results screen can render immediately.
          </p>
        </div>

        <div className="panel p-6">
          <div className="space-y-5 text-sm leading-7 text-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Suggested capture
              </p>
              <p className="mt-2">
                Use even lighting, keep the wound centered, and avoid heavy shadows that could
                distort the surface.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Current analysis mode
              </p>
              <p className="mt-2">
                The backend returns a mocked clinical summary by default, but the API route is ready
                for a Gemini integration later.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ImageUpload />
    </section>
  );
}
