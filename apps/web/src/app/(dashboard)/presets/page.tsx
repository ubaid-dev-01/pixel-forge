"use client";

import { useQuery } from "convex/react";
import { refs } from "@/lib/convexRefs";

export default function PresetsPage() {
  const presets = useQuery(refs.presetsList, {});
  return (
    <div className="mx-auto max-w-[800px]">
      <h1 className="font-display text-[40px]">Presets</h1>
      <p className="mt-8 text-text-muted">Named parameter sets stored per user. They are not shared across accounts.</p>
      <ul className="mt-24 divide-y divide-border border border-border">
        {(presets ?? []).map((preset: { _id: string; name: string; tool: string }) => (
          <li key={preset._id} className="px-16 py-16">
            <p>{preset.name}</p>
            <p className="font-mono text-[12px] text-text-muted">{preset.tool}</p>
          </li>
        ))}
        {presets && presets.length === 0 ? <li className="px-16 py-24 text-text-muted">No saved presets.</li> : null}
      </ul>
    </div>
  );
}
