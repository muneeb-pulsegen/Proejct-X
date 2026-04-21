import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import ResultCard from "@/components/ResultCard";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { findAnalysisByIdForUser } from "@/lib/db";

type ResultPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const { id } = await searchParams;

  if (!id) {
    redirect("/upload");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifyAuthToken(token) : null;

  if (!session) {
    redirect("/login");
  }

  const analysis = await findAnalysisByIdForUser(id, session.sub);

  if (!analysis) {
    return (
      <section className="flex flex-1 items-center justify-center py-14">
        <div className="panel max-w-xl p-8 text-center">
          <span className="eyebrow">No result found</span>
          <h1 className="mt-5 text-3xl font-semibold text-slate-950">That analysis could not be loaded.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            It may have expired from the in-memory fallback or the link may be incomplete. Upload a
            new image to generate another result.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link className="btn-primary" href="/upload">
              Upload another image
            </Link>
            <Link className="btn-secondary" href="/">
              Back home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="eyebrow">Analysis result</span>
          <h1 className="section-title">Structured wound summary ready for review.</h1>
          <p className="section-copy">
            The image and AI findings below are tied to the current authenticated user session.
          </p>
        </div>
        <Link className="btn-secondary" href="/upload">
          Analyze another image
        </Link>
      </div>

      <ResultCard
        createdAt={analysis.createdAt}
        imageData={analysis.imageData}
        result={analysis.result}
      />
    </section>
  );
}
