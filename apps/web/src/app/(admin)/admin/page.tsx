"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/Button";
import { refs } from "@/lib/convexRefs";

type Tab = "overview" | "users" | "jobs" | "health" | "flags";

type AdminUserRow = {
  profileId: string;
  userId: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
  plan: "free" | "pro" | "team";
  retention: string;
  disabledAt: number | null;
  createdAt: number;
};

type AdminJobRow = {
  _id: string;
  tool: string;
  status: string;
  createdAt: number;
};

type AdminHealthRow = {
  _id: string;
  provider: string;
  available: boolean;
  device?: string;
  interpolationAvailable: boolean;
  reason?: string;
  checkedAt: number;
};

type AdminFlagRow = {
  _id: string;
  key: string;
  enabled: boolean;
  description?: string;
};

export default function AdminPage() {
  const me = useQuery(refs.usersMe);
  const overview = useQuery(refs.adminOverview);
  const users = useQuery(refs.adminListUsers);
  const jobs = useQuery(refs.adminListJobs);
  const health = useQuery(refs.adminListHealth);
  const flags = useQuery(refs.adminListFlags);

  const claimFirstAdmin = useMutation(refs.adminClaimFirstAdmin);
  const setUserRole = useMutation(refs.adminSetUserRole);
  const setUserPlan = useMutation(refs.adminSetUserPlan);
  const setUserDisabled = useMutation(refs.adminSetUserDisabled);
  const cancelJob = useMutation(refs.adminCancelJob);
  const setFlag = useMutation(refs.adminSetFlag);
  const seedFlags = useMutation(refs.adminSeedFlags);

  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const tabs = useMemo(
    () =>
      [
        ["overview", "Overview"],
        ["users", "Users"],
        ["jobs", "Jobs"],
        ["health", "Health"],
        ["flags", "Flags"],
      ] as const,
    [],
  );

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setMessage(null);
    try {
      await fn();
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  if (me === undefined) {
    return <p className="text-text-muted">Loading…</p>;
  }

  if (me.role !== "admin") {
    return (
      <main className="mx-auto max-w-[640px] px-24 py-64">
        <h1 className="font-display text-[2rem] text-brand-navy">Admin</h1>
        <p className="mt-12 text-text-muted">
          Restricted to profiles with <code className="font-mono text-[13px]">role=admin</code>.
        </p>
        <p className="mt-24 text-[15px] text-text-secondary">
          If this is a fresh deployment and no admin exists yet, claim the first admin seat:
        </p>
        <Button
          className="mt-20"
          loading={busy === "claim"}
          onClick={() =>
            run("claim", async () => {
              await claimFirstAdmin({});
              window.location.reload();
            })
          }
        >
          Claim first admin
        </Button>
        {message ? <p className="mt-16 text-danger">{message}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-16">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-subtle">Control</p>
          <h1 className="font-display mt-6 text-[2.25rem] text-brand-navy">Admin</h1>
        </div>
        {message ? <p className="text-[14px] text-text-muted">{message}</p> : null}
      </div>

      <div className="mt-28 flex flex-wrap gap-6 border-b border-border pb-0">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-40 border-b-2 px-14 text-[14px] font-medium transition-colors ${
              tab === id
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <section className="mt-28">
          {overview === undefined ? (
            <p className="text-text-muted">Loading overview…</p>
          ) : (
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(overview.counts as Record<string, number>).map(([key, value]) => (
                <article key={key} className="border border-border bg-bg-elevated px-20 py-18">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-text-subtle">{key}</p>
                  <p className="mt-8 font-display text-[2rem] tabular-nums">{value}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "users" ? (
        <section className="mt-28 overflow-x-auto">
          {users === undefined ? (
            <p className="text-text-muted">Loading users…</p>
          ) : (
            <table className="w-full min-w-[780px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-text-subtle">
                  <th className="py-12 pr-12 font-medium">User</th>
                  <th className="py-12 pr-12 font-medium">Role</th>
                  <th className="py-12 pr-12 font-medium">Plan</th>
                  <th className="py-12 pr-12 font-medium">Status</th>
                  <th className="py-12 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(users as AdminUserRow[]).map((row) => (
                  <tr key={row.profileId} className="border-b border-border align-middle">
                    <td className="py-14 pr-12">
                      <p className="font-medium text-text">{row.name ?? "—"}</p>
                      <p className="text-text-muted">{row.email ?? row.userId}</p>
                    </td>
                    <td className="py-14 pr-12">
                      <select
                        className="min-h-40 rounded-[6px] border border-border bg-surface px-10"
                        value={row.role}
                        disabled={busy === row.profileId}
                        onChange={(e) =>
                          run(row.profileId, () =>
                            setUserRole({
                              profileId: row.profileId as never,
                              role: e.target.value as "user" | "admin",
                            }),
                          )
                        }
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-14 pr-12">
                      <select
                        className="min-h-40 rounded-[6px] border border-border bg-surface px-10"
                        value={row.plan}
                        disabled={busy === row.profileId}
                        onChange={(e) =>
                          run(row.profileId, () =>
                            setUserPlan({
                              profileId: row.profileId as never,
                              plan: e.target.value as "free" | "pro" | "team",
                            }),
                          )
                        }
                      >
                        <option value="free">free</option>
                        <option value="pro">pro</option>
                        <option value="team">team</option>
                      </select>
                    </td>
                    <td className="py-14 pr-12">
                      {row.disabledAt ? (
                        <span className="text-danger">Disabled</span>
                      ) : (
                        <span className="text-success">Active</span>
                      )}
                    </td>
                    <td className="py-14">
                      <Button
                        variant={row.disabledAt ? "secondary" : "danger"}
                        loading={busy === `dis-${row.profileId}`}
                        onClick={() =>
                          run(`dis-${row.profileId}`, () =>
                            setUserDisabled({
                              profileId: row.profileId as never,
                              disabled: !row.disabledAt,
                            }),
                          )
                        }
                      >
                        {row.disabledAt ? "Enable" : "Disable"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      {tab === "jobs" ? (
        <section className="mt-28 overflow-x-auto">
          {jobs === undefined ? (
            <p className="text-text-muted">Loading jobs…</p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-text-subtle">
                  <th className="py-12 pr-12 font-medium">Tool</th>
                  <th className="py-12 pr-12 font-medium">Status</th>
                  <th className="py-12 pr-12 font-medium">Created</th>
                  <th className="py-12 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(jobs as AdminJobRow[]).map((job) => (
                  <tr key={job._id} className="border-b border-border">
                    <td className="py-14 pr-12 font-medium">{job.tool}</td>
                    <td className="py-14 pr-12 font-mono text-[12px] uppercase tracking-[0.08em] text-text-muted">
                      {job.status}
                    </td>
                    <td className="py-14 pr-12 text-text-muted">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                    <td className="py-14">
                      {["queued", "validating", "processing", "finalizing"].includes(job.status) ? (
                        <Button
                          variant="danger"
                          loading={busy === job._id}
                          onClick={() => run(job._id, () => cancelJob({ jobId: job._id as never }))}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <span className="text-text-subtle">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-text-muted">
                      No jobs yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      {tab === "health" ? (
        <section className="mt-28 grid gap-12 md:grid-cols-2">
          {health === undefined ? (
            <p className="text-text-muted">Loading health…</p>
          ) : health.length === 0 ? (
            <p className="text-text-muted">No provider heartbeats yet. Start the Python worker to populate this.</p>
          ) : (
            (health as AdminHealthRow[]).map((row) => (
              <article key={row._id} className="border border-border bg-bg-elevated p-20">
                <div className="flex items-center justify-between gap-12">
                  <h2 className="font-display text-[1.2rem]">{row.provider}</h2>
                  <span className={row.available ? "text-success" : "text-danger"}>
                    {row.available ? "Available" : "Down"}
                  </span>
                </div>
                <dl className="mt-16 space-y-8 text-[14px] text-text-muted">
                  <div className="flex justify-between gap-12">
                    <dt>Device</dt>
                    <dd>{row.device ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-12">
                    <dt>Interpolation</dt>
                    <dd>{row.interpolationAvailable ? "yes" : "no"}</dd>
                  </div>
                  <div className="flex justify-between gap-12">
                    <dt>Checked</dt>
                    <dd>{new Date(row.checkedAt).toLocaleString()}</dd>
                  </div>
                  {row.reason ? (
                    <div>
                      <dt className="text-text-subtle">Reason</dt>
                      <dd className="mt-4 text-text">{row.reason}</dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            ))
          )}
        </section>
      ) : null}

      {tab === "flags" ? (
        <section className="mt-28">
          <div className="mb-20 flex flex-wrap items-center gap-12">
            <Button
              variant="secondary"
              loading={busy === "seed"}
              onClick={() => run("seed", () => seedFlags({}))}
            >
              Seed default flags
            </Button>
          </div>
          {flags === undefined ? (
            <p className="text-text-muted">Loading flags…</p>
          ) : flags.length === 0 ? (
            <p className="text-text-muted">No flags yet. Seed defaults, then toggle them.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {(flags as AdminFlagRow[]).map((flag) => (
                <li key={flag._id} className="flex flex-wrap items-center justify-between gap-16 py-18">
                  <div>
                    <p className="font-mono text-[14px] font-medium">{flag.key}</p>
                    <p className="mt-4 text-[14px] text-text-muted">{flag.description ?? "—"}</p>
                  </div>
                  <Button
                    variant={flag.enabled ? "secondary" : "primary"}
                    loading={busy === flag.key}
                    onClick={() =>
                      run(flag.key, () =>
                        setFlag({ key: flag.key, enabled: !flag.enabled }),
                      )
                    }
                  >
                    {flag.enabled ? "On — turn off" : "Off — turn on"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

    </main>
  );
}
