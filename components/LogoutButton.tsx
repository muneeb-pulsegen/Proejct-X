"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="btn-primary h-10 px-4 py-0"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/logout", { method: "POST" });
          router.push("/login");
          router.refresh();
        });
      }}
      type="button"
    >
      {isPending ? "Signing out..." : "Logout"}
    </button>
  );
}
