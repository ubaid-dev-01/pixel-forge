"use client";

import { useQuery } from "convex/react";
import { refs } from "@/lib/convexRefs";

export default function UsagePage() {
  const usage = useQuery(refs.usageSnapshot);
  if (!usage) return <p>Loading usage…</p>;
  return (
    <div className="mx-auto max-w-[800px]">
      <h1 className="font-display text-[40px]">Usage</h1>
      <p className="mt-8 text-text-muted">Period starts {new Date(usage.periodStart).toUTCString()}. Billing is not connected; limits still reserve and refund on failure.</p>
      <dl className="mt-32 grid gap-16">
        <Row label="Plan" value={usage.plan} />
        <Row label="Images" value={`${usage.imageCount} / ${usage.imageLimit}`} />
        <Row label="Videos" value={`${usage.videoCount} / ${usage.videoLimit}`} />
        <Row label="Input bytes" value={String(usage.inputBytes)} />
        <Row label="Output bytes" value={String(usage.outputBytes)} />
        <Row label="Processing time (ms)" value={String(usage.processingTimeMs)} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-16">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-mono text-[14px] uppercase tracking-[0.12em]">{value}</dd>
    </div>
  );
}
