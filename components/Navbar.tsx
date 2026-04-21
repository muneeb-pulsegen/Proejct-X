import Link from "next/link";

import { getCurrentUser, getRoleHomePath } from "@/lib/auth";

import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();
  const homePath = user ? getRoleHomePath(user.role) : "/";

  const links = user
    ? user.role === "coach"
      ? [
          { href: "/coach/dashboard", label: "Dashboard" },
          { href: "/coach/team", label: "Team" },
          { href: "/profile", label: "Profile" }
        ]
      : [
          { href: "/player/dashboard", label: "Dashboard" },
          { href: "/upload", label: "Upload" },
          { href: "/profile", label: "Profile" }
        ]
    : [];

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-full border border-white/70 bg-white/78 px-5 py-3 shadow-soft backdrop-blur-xl">
          <Link className="flex items-center gap-3" href={homePath}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20">
              IX
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">InjuryX</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">team injury hub</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                {links.map((item) => (
                  <Link
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="ml-2 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <Avatar imageData={user.profileImageData} name={user.name} size="sm" />
                  <div className="pr-1">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{user.role}</p>
                  </div>
                </div>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                  href="/login"
                >
                  Login
                </Link>
                <Link className="btn-primary h-10 px-4 py-0" href="/signup">
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
