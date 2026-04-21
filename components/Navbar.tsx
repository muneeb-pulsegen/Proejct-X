"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const appLinks = [{ href: "/upload", label: "Upload" }];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isProtectedArea = pathname.startsWith("/upload") || pathname.startsWith("/result");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const handleLogout = () => {
    startTransition(async () => {
      await fetch("/api/logout", {
        method: "POST"
      });

      router.push("/login");
      router.refresh();
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/70 bg-white/78 px-5 py-3 shadow-soft backdrop-blur-xl">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20">
              IX
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">InjuryX</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">wound analysis</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Link
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              href="/"
            >
              Home
            </Link>

            {isProtectedArea ? (
              <>
                {appLinks.map((item) => (
                  <Link
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      pathname.startsWith(item.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  className="btn-primary h-10 px-4 py-0"
                  disabled={isPending}
                  onClick={handleLogout}
                  type="button"
                >
                  {isPending ? "Signing out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                {!isAuthPage ? (
                  <Link
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    href="/login"
                  >
                    Login
                  </Link>
                ) : null}
                <Link className="btn-primary h-10 px-4 py-0" href={isAuthPage ? "/" : "/signup"}>
                  {isAuthPage ? "Back Home" : "Signup"}
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
