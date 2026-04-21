"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
  redirectTo?: string;
};

export default function AuthForm({ mode, redirectTo = "" }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"player" | "coach">("player");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isLogin = mode === "login";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/${mode}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(isLogin ? { email, password } : { name, email, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          return;
        }

        const destination = redirectTo || (data.user?.role === "coach" ? "/coach/dashboard" : "/player/dashboard");
        router.push(destination);
        router.refresh();
      } catch (requestError) {
        console.error(`${mode} request failed`, requestError);
        setError("We could not complete the request. Please try again.");
      }
    });
  };

  return (
    <div className="panel w-full max-w-xl p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          {isLogin ? "Secure login" : "New account"}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          {isLogin ? "Sign in" : "Create your InjuryX account"}
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          {isLogin
            ? "Use your email and password to continue."
            : "Enter an email and password to unlock the upload flow."}
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {!isLogin ? (
          <>
            <div>
              <label className="label" htmlFor={`${mode}-name`}>
                Full Name
              </label>
              <input
                className="field"
                id={`${mode}-name`}
                onChange={(event) => setName(event.target.value)}
                placeholder="Taylor Morgan"
                required
                type="text"
                value={name}
              />
            </div>
            <div>
              <label className="label">Account Type</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["player", "coach"] as const).map((value) => (
                  <button
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${
                      role === value
                        ? "border-blue-200 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    key={value}
                    onClick={() => setRole(value)}
                    type="button"
                  >
                    <p className="text-sm font-semibold capitalize">{value}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {value === "player"
                        ? "Submit injury reports and manage invites."
                        : "Create a team, invite players, and view analytics."}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <div>
          <label className="label" htmlFor={`${mode}-email`}>
            Email
          </label>
          <input
            autoComplete="email"
            className="field"
            id={`${mode}-email`}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div>
          <label className="label" htmlFor={`${mode}-password`}>
            Password
          </label>
          <input
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="field"
            id={`${mode}-password`}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
            required
            type="password"
            value={password}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button className="btn-primary h-12 w-full" disabled={isPending} type="submit">
          {isPending
            ? isLogin
              ? "Signing in..."
              : "Creating account..."
            : isLogin
              ? "Login"
              : "Signup"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {isLogin ? "Need an account?" : "Already registered?"}{" "}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" href={isLogin ? "/signup" : "/login"}>
          {isLogin ? "Create one" : "Login"}
        </Link>
      </p>
    </div>
  );
}
