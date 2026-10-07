"use client";

const STAGES = ["preparing", "analyzing", "restoring", "upsampling", "segmenting", "encoding", "finalizing"] as const;

export function JobProgress({
  status,
  stage,
  progress,
  onCancel,
}: {
  status: string;
  stage?: string;
  progress?: number;
  onCancel?: () => void;
}) {
  const label = stage ?? status;
  const showPercent = typeof progress === "number" && progress >= 0 && progress <= 100 && status === "processing";
  return (
    <div className="border border-border bg-surface p-24">
      <div className="flex items-center justify-between gap-16">
        <p className="text-[12px] uppercase tracking-[0.18em] text-accent">{label}</p>
        {onCancel && status !== "completed" && status !== "failed" ? (
          <button type="button" className="min-h-44 px-12 text-[14px] text-text-muted hover:text-text" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
      <ol className="mt-16 grid gap-8 sm:grid-cols-4">
        {["Uploading", "Queued", "Processing", "Finalizing"].map((item) => {
          const active =
            (item === "Queued" && status === "queued") ||
            (item === "Processing" && (status === "processing" || status === "validating")) ||
            (item === "Finalizing" && status === "finalizing") ||
            (item === "Uploading" && status === "uploading");
          return (
            <li key={item} className={`text-[14px] ${active ? "text-text" : "text-text-subtle"}`}>
              {item}
            </li>
          );
        })}
      </ol>
      {showPercent ? (
        <div className="mt-16 h-4 bg-surface-3" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} role="progressbar">
          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
      ) : (
        <p className="mt-16 text-[14px] text-text-muted">
          Progress is reported from the worker. PixelForge does not invent a percentage.
        </p>
      )}
      {stage ? (
        <p className="mt-12 font-mono text-[12px] uppercase tracking-[0.14em] text-text-subtle">
          {STAGES.includes(stage as (typeof STAGES)[number]) ? stage : status}
        </p>
      ) : null}
    </div>
  );
}
