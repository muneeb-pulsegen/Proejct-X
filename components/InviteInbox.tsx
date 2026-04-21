"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Invite = {
  id: string;
  teamName: string;
  coachName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

type InviteInboxProps = {
  invites: Invite[];
};

export default function InviteInbox({ invites: initialInvites }: InviteInboxProps) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAction = (inviteId: string, action: "accept" | "decline") => {
    setError("");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/team/invites/${inviteId}/respond`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ action })
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to update invite.");
          return;
        }

        setInvites((current) =>
          current.map((invite) =>
            invite.id === inviteId
              ? { ...invite, status: action === "accept" ? "accepted" : "declined" }
              : action === "accept"
                ? { ...invite, status: invite.status === "pending" ? "declined" : invite.status }
                : invite
          )
        );
        router.refresh();
      } catch (requestError) {
        console.error("Invite update failed", requestError);
        setError("Unable to update invite.");
      }
    });
  };

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pending invites</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Team invitations</h2>
        </div>
        <p className="text-sm text-slate-500">{invites.filter((invite) => invite.status === "pending").length} pending</p>
      </div>

      {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="mt-6 space-y-4">
        {invites.length === 0 ? (
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
            No team invites yet. Once a coach adds you from the existing member pool, it will show up here.
          </div>
        ) : (
          invites.map((invite) => (
            <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4" key={invite.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-950">{invite.teamName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Coach {invite.coachName} · {new Date(invite.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {invite.status === "pending" ? (
                  <div className="flex gap-3">
                    <button className="btn-secondary" disabled={isPending} onClick={() => handleAction(invite.id, "decline")} type="button">
                      Decline
                    </button>
                    <button className="btn-primary" disabled={isPending} onClick={() => handleAction(invite.id, "accept")} type="button">
                      Accept
                    </button>
                  </div>
                ) : (
                  <div className={`rounded-full px-3 py-1 text-sm font-semibold ${invite.status === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {invite.status}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
