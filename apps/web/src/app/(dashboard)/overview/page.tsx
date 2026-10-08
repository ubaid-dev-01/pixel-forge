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
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-subtle">Workspace</p>
      <h1 className="font-display mt-8 text-[2.25rem] text-brand-navy">Overview</h1>
      <p className="mt-10 text-text-muted">{me?.email ?? "Sign in to load your jobs."}</p>

      <div className="mt-32 grid gap-12 md:grid-cols-3">
        {[
          ["Plan", usage?.plan ?? "—"],
          ["Images this period", usage ? `${usage.imageCount} / ${usage.imageLimit}` : "—"],
          ["Videos this period", usage ? `${usage.videoCount} / ${usage.videoLimit}` : "—"],
        ].map(([label, value]) => (
          <article key={label} className="border border-border bg-bg-elevated px-20 py-18">
            <p className="text-[11px] uppercase tracking-[0.12em] text-text-subtle">{label}</p>
            <p className="mt-8 font-display text-[1.65rem] capitalize tabular-nums">{value}</p>
          </article>
        ))}
      </div>

      <h2 className="mt-48 font-display text-[1.35rem] text-brand-navy">Quick tools</h2>
      <ul className="mt-16 divide-y divide-border border-y border-border">
        {TOOL_CATALOG.slice(0, 8).map((tool) => (
          <li key={tool.id}>
            <Link
              href={tool.href}
              className="flex items-center justify-between gap-16 py-14 text-[15px] transition-colors hover:text-accent"
            >
              <span>{tool.shortLabel}</span>
              <span className="text-text-subtle">→</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-48 font-display text-[1.35rem] text-brand-navy">Recent jobs</h2>
      <ul className="mt-16 divide-y divide-border border border-border bg-bg-elevated">
        {(recent ?? []).map((job: { _id: string; tool: string; status: string; createdAt: number }) => (
          <li key={job._id} className="flex items-center justify-between gap-16 px-16 py-14">
            <span className="font-medium">{job.tool}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
              {job.status}
            </span>
          </li>
        ))}
        {recent && recent.length === 0 ? (
          <li className="px-16 py-24 text-text-muted">No jobs yet.</li>
        ) : null}
        {recent === undefined ? <li className="px-16 py-24 text-text-muted">Loading…</li> : null}
      </ul>
    </div>
  );
}
