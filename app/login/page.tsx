import AuthForm from "@/components/AuthForm";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <section className="grid flex-1 gap-10 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="space-y-6">
        <span className="eyebrow">Welcome back</span>
        <div className="space-y-4">
          <h1 className="section-title">Sign in to continue your injury reporting workflow.</h1>
          <p className="section-copy">
            Minimal credentials, secure cookie sessions, and a direct path back to uploading and
            reviewing results.
          </p>
        </div>
        <div className="panel max-w-xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Inside the MVP
          </p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            <p>Passwords are hashed before storage and the session token stays in an HTTP-only cookie.</p>
            <p>Protected routes are guarded both in middleware and again on the server for result access.</p>
          </div>
        </div>
      </div>

      <AuthForm mode="login" redirectTo={next || ""} />
    </section>
  );
}
