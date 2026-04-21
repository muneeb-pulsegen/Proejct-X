"use client";

import Link from "next/link";

import Avatar from "@/components/Avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type Member = {
  id: string;
  name: string;
  email: string;
  profileImageData: string | null;
  reportCount: number;
  averagePain: string;
  latestReport: {
    id: string;
    injuryTitle: string;
    bodyArea: string;
    injuryType: string;
    severity: "Mild" | "Moderate" | "Severe";
    painLevel: number;
    createdAt: string;
    notes: string;
  } | null;
};

function severityVariant(severity: "Mild" | "Moderate" | "Severe") {
  if (severity === "Severe") {
    return "destructive";
  }

  if (severity === "Moderate") {
    return "warning";
  }

  return "success";
}

export default function TeamRoster({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <Card className="border-dashed bg-white/75">
        <CardHeader>
          <CardTitle>No players on the roster yet</CardTitle>
          <CardDescription>
            Invite existing player accounts to start building out the team.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => (
        <Dialog key={member.id}>
          <DialogTrigger asChild>
            <button className="w-full text-left" type="button">
              <Card className="group h-full border-slate-200/90 bg-white/88 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_30px_120px_rgba(15,23,42,0.12)]">
                <CardHeader className="gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar imageData={member.profileImageData} name={member.name} />
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg">{member.name}</CardTitle>
                      <CardDescription className="truncate">{member.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[22px] bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reports</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{member.reportCount}</p>
                    </div>
                    <div className="rounded-[22px] bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Avg pain</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{member.averagePain}</p>
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">Latest report</p>
                      {member.latestReport ? (
                        <Badge variant={severityVariant(member.latestReport.severity)}>{member.latestReport.severity}</Badge>
                      ) : (
                        <Badge variant="secondary">No report</Badge>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {member.latestReport
                        ? `${member.latestReport.injuryTitle} · ${member.latestReport.bodyArea}`
                        : "Open the player card to review contact details and report status."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar imageData={member.profileImageData} name={member.name} size="lg" />
                <div>
                  <DialogTitle>{member.name}</DialogTitle>
                  <DialogDescription>{member.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total reports</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{member.reportCount}</p>
              </div>
              <div className="rounded-[22px] bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Average pain</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{member.averagePain}</p>
              </div>
              <div className="rounded-[22px] bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current status</p>
                <div className="mt-3">
                  {member.latestReport ? (
                    <Badge variant={severityVariant(member.latestReport.severity)}>{member.latestReport.severity}</Badge>
                  ) : (
                    <Badge variant="secondary">No report</Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[24px] bg-slate-950 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Player snapshot</p>
                <p className="mt-4 text-2xl font-semibold">
                  {member.latestReport ? member.latestReport.injuryTitle : "No active report"}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {member.latestReport
                    ? `${member.latestReport.injuryType} affecting ${member.latestReport.bodyArea}, last updated ${new Date(member.latestReport.createdAt).toLocaleString()}.`
                    : "This player has not submitted an injury report yet."}
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Latest notes</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {member.latestReport?.notes || "No player notes have been submitted for this account yet."}
                </p>
              </div>
            </div>

            {member.latestReport ? (
              <DialogFooter>
                <Link href={`/result?id=${member.latestReport.id}`}>
                  <Button>Open Latest Report</Button>
                </Link>
              </DialogFooter>
            ) : null}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
