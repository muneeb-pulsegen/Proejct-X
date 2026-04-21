import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <section className="grid flex-1 gap-10 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="space-y-6">
        <span className="eyebrow">Create your account</span>
        <div className="space-y-4">
          <h1 className="section-title">Create a player or coach account and enter the right workspace.</h1>
          <p className="section-copy">
            Players can submit injuries and manage invites. Coaches automatically get a team and
            unlock the dashboard plus roster management.
          </p>
        </div>
        <div className="panel max-w-xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            What you get
          </p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            <p>Coach signup auto-creates a team, while player signup starts unassigned until a coach invites them.</p>
            <p>Profile, reporting, and team workflows are already wired so both roles land in a complete product experience.</p>
          </div>
        </div>
      </div>

      <AuthForm mode="signup" />
    </section>
  );
}
