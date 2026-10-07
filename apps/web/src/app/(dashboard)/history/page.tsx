"use client";

import { useState } from "react";
import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { refs } from "@/lib/convexRefs";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import Link from "next/link";

export default function HistoryPage() {
  const token = useAuthToken();
  const [kind, setKind] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const jobs = useQuery(refs.jobsList, {
    kind: kind || undefined,
    status: status || undefined,
    search: search || undefined,
  });

  return (
    <div className="mx-auto max-w-[1100px]">
      <h1 className="font-display text-[40px]">History</h1>
      <div className="mt-24 flex flex-wrap gap-12">
        <Select value={kind} onChange={(event) => setKind(event.target.value)} aria-label="Filter by media">
          <option value="">All media</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
        <Input
          placeholder="Search filename"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search filename"
        />
      </div>
      <ul className="mt-24 divide-y divide-border border border-border">
        {(jobs ?? []).map((job: { _id: string; tool: string; status: string; filename: string; createdAt: number }) => (
          <li key={job._id} className="flex flex-wrap items-center justify-between gap-16 px-16 py-16">
            <div>
              <p>{job.filename}</p>
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-text-muted">
                {job.tool} · {job.status} · {new Date(job.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-8">
              <Link href={`/tools/${job.tool.split(".")[1] ?? "upscale"}`} className="min-h-44 px-12 py-12 text-[14px]">
                Open
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!token) return;
                  void apiFetch(`/jobs/${job._id}`, token, { method: "DELETE" });
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
        {jobs && jobs.length === 0 ? <li className="px-16 py-24 text-text-muted">No matching jobs.</li> : null}
      </ul>
    </div>
  );
}
