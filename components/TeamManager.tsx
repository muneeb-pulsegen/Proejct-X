"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, Send } from "lucide-react";

import Avatar from "@/components/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
      <Card className="bg-white/86">
        <CardHeader>
          <CardTitle>Invite players</CardTitle>
          <CardDescription>Search existing accounts and pull them into the team with one action.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by player name or email"
              type="text"
              value={query}
            />
          </div>

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <div className="flex flex-col gap-4">
            {players.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
                No eligible players found yet. Players need to sign up before they can be invited.
              </div>
            ) : (
              players.map((player) => (
                <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between" key={player.id}>
                  <div className="flex items-center gap-4">
                    <Avatar imageData={player.profileImageData} name={player.name} />
                    <div>
                      <p className="font-semibold text-slate-950">{player.name}</p>
                      <p className="text-sm text-slate-500">{player.email}</p>
                    </div>
                  </div>
                  <Button
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
                    <Send className="size-4" />
                    Invite
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/86">
        <CardHeader>
          <CardTitle>Invite activity</CardTitle>
          <CardDescription>Track what is still pending and who has already joined.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {invites.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-sm leading-6 text-slate-600">
              No invites sent yet.
            </div>
          ) : (
            invites.map((invite) => (
              <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4" key={invite.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{invite.playerName}</p>
                    <p className="mt-1 text-sm text-slate-500">{new Date(invite.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge
                    variant={
                      invite.status === "pending"
                        ? "warning"
                        : invite.status === "accepted"
                          ? "success"
                          : "secondary"
                    }
                  >
                    {invite.status}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-slate-500">
                  {invite.status === "pending"
                    ? "Waiting on the player to accept the invitation."
                    : invite.status === "accepted"
                      ? "This player has joined the team."
                      : "This invitation was declined or is no longer active."}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
