import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <section className="grid flex-1 gap-10 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="space-y-6">
        <span className="eyebrow">Create your account</span>
        <div className="space-y-4">
          <h1 className="section-title">Start uploading wound images with a secure account.</h1>
          <p className="section-copy">
            The sign-up flow is intentionally simple so the experience stays friction-light while
            still protecting the upload and results surfaces.
          </p>
        </div>
        <div className="panel max-w-xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            What you get
          </p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            <p>Immediate access to the upload workspace right after account creation.</p>
            <p>Persistent storage when MongoDB is configured, plus an in-memory fallback for local demos.</p>
          </div>
        </div>
      </div>

      <AuthForm mode="signup" />
    </section>
  );
}
