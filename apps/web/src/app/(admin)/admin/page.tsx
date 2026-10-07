"use client";

import { useQuery } from "convex/react";
import { refs } from "@/lib/convexRefs";

export default function AdminPage() {
  const data = useQuery(refs.adminOverview);
  if (data === undefined) return <p>Loading admin overview…</p>;
  return (
    <main className="mx-auto max-w-[1100px] px-24 py-48">
      <h1 className="font-display text-[40px]">Internal</h1>
      <p className="mt-8 text-text-muted">Restricted to profiles with role=admin. Ordinary users cannot query this.</p>
      <pre className="mt-24 overflow-auto border border-border bg-surface p-16 font-mono text-[12px] text-text-muted">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}
