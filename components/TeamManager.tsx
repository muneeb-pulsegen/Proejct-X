"use client";

import { useEffect, useState, useTransition } from "react";

import Avatar from "@/components/Avatar";

type Player = {
  id: string;
  name: string;
  email: string;
  profileImageData: string | null;
};

type Invite = {
  id: string;
  playerName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

type TeamManagerProps = {
  initialPlayers: Player[];
  initialInvites: Invite[];
};

export default function TeamManager({
  initialPlayers,
  initialInvites
}: TeamManagerProps) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [invites, setInvites] = useState(initialInvites);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (response.ok) {
          setPlayers(data.players || []);
        }
      } catch (requestError) {
        console.error("Player search failed", requestError);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Invite players</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Search existing accounts</h2>
        <div className="mt-6">
          <input
            className="field"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by player name or email"
            type="text"
            value={query}
          />
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-6 space-y-4">
          {players.length === 0 ? (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
              No eligible players found yet. Players need to sign up before they can be invited.
            </div>
          ) : (
            players.map((player) => (
              <div className="flex flex-col gap-4 rounded-[22px] border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between" key={player.id}>
                <div className="flex items-center gap-4">
                  <Avatar imageData={player.profileImageData} name={player.name} />
                  <div>
                    <p className="font-semibold text-slate-950">{player.name}</p>
                    <p className="text-sm text-slate-500">{player.email}</p>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  disabled={isPending}
                  onClick={() => {
                    setError("");
                    startTransition(async () => {
                      try {
                        const response = await fetch("/api/team/invites", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({ playerUserId: player.id })
                        });
                        const data = await response.json();
                        if (!response.ok) {
                          setError(data.error || "Unable to create invite.");
                          return;
                        }

                        setInvites((current) => [
                          {
                            id: data.invite.id,
                            playerName: player.name,
                            status: "pending",
                            createdAt: data.invite.createdAt
                          },
                          ...current
                        ]);
                        setPlayers((current) => current.filter((entry) => entry.id !== player.id));
                      } catch (requestError) {
                        console.error("Invite request failed", requestError);
                        setError("Unable to create invite.");
                      }
                    });
                  }}
                  type="button"
                >
                  Invite
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Invite activity</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Sent invites</h2>
        <div className="mt-6 space-y-4">
          {invites.length === 0 ? (
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
              No invites sent yet.
            </div>
          ) : (
            invites.map((invite) => (
              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4" key={invite.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{invite.playerName}</p>
                    <p className="mt-1 text-sm text-slate-500">{new Date(invite.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-sm font-semibold ${invite.status === "pending" ? "bg-amber-50 text-amber-700" : invite.status === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {invite.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
