"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { TOOL_CATALOG } from "@pixelforge/shared";
import { refs } from "@/lib/convexRefs";

export default function OverviewPage() {
  const me = useQuery(refs.usersMe);
  const recent = useQuery(refs.jobsRecent);
  const usage = useQuery(refs.usageSnapshot);

  return (
    <div className="mx-auto max-w-[1100px]">
      <p className="text-[12px] uppercase tracking-[0.18em] text-text-subtle">Workspace</p>
      <h1 className="font-display mt-8 text-[40px]">Overview</h1>
      <p className="mt-8 text-text-muted">{me?.email ?? "Sign in to load your jobs."}</p>
      <div className="mt-32 grid gap-16 md:grid-cols-3">
        <article className="border border-border p-24">
          <p className="text-[12px] uppercase tracking-[0.16em] text-text-subtle">Plan</p>
          <p className="mt-8 text-[24px] capitalize">{usage?.plan ?? "—"}</p>
        </article>
        <article className="border border-border p-24">
          <p className="text-[12px] uppercase tracking-[0.16em] text-text-subtle">Images this period</p>
          <p className="mt-8 text-[24px]">
            {usage ? `${usage.imageCount} / ${usage.imageLimit}` : "—"}
          </p>
        </article>
        <article className="border border-border p-24">
          <p className="text-[12px] uppercase tracking-[0.16em] text-text-subtle">Videos this period</p>
          <p className="mt-8 text-[24px]">
            {usage ? `${usage.videoCount} / ${usage.videoLimit}` : "—"}
          </p>
        </article>
      </div>
      <h2 className="mt-48 text-[18px]">Quick tools</h2>
      <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {TOOL_CATALOG.slice(0, 8).map((tool) => (
          <Link key={tool.id} href={tool.href} className="border border-border p-16 text-[15px] hover:border-border-strong">
            {tool.shortLabel}
          </Link>
        ))}
      </div>
      <h2 className="mt-48 text-[18px]">Recent jobs</h2>
      <ul className="mt-16 divide-y divide-border border border-border">
        {(recent ?? []).map((job: { _id: string; tool: string; status: string; createdAt: number }) => (
          <li key={job._id} className="flex items-center justify-between gap-16 px-16 py-16">
            <span>{job.tool}</span>
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-text-muted">{job.status}</span>
          </li>
        ))}
        {recent && recent.length === 0 ? <li className="px-16 py-24 text-text-muted">No jobs yet.</li> : null}
      </ul>
    </div>
  );
}
