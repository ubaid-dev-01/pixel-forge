"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { toolBySlug, describeError } from "@pixelforge/shared";
import { ERROR_CODES, type ErrorCode } from "@pixelforge/types";
import { UploadZone } from "@/components/media/UploadZone";
import { BeforeAfterViewer } from "@/components/media/BeforeAfterViewer";
import { JobProgress } from "@/components/jobs/JobProgress";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { apiFetch, fetchAuthorizedDownload } from "@/lib/api";
import { refs } from "@/lib/convexRefs";
import { estimatedUpscaleSize } from "@pixelforge/shared";
import { isErrorCode } from "@pixelforge/shared";

export default function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const tool = toolBySlug(slug);
  const token = useAuthToken();
  const [file, setFile] = useState<File | null>(null);
  const [dims, setDims] = useState<{ width?: number; height?: number }>({});
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<ReturnType<typeof describeError> | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("output");
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const job = useQuery(refs.jobsGet, jobId ? { jobId } : "skip");

  const estimate = useMemo(() => {
    if (!dims.width || !dims.height) return null;
    return estimatedUpscaleSize(dims.width, dims.height, scale);
  }, [dims, scale]);

  useEffect(() => {
    if (!token || !job?.outputFileId || job.status !== "completed") {
      setOutputUrl(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    setOutputUrl(null);
    void (async () => {
      try {
        const download = await fetchAuthorizedDownload(`/files/${job.outputFileId}/download`, token);
        if (cancelled) {
          if (download.objectUrl) URL.revokeObjectURL(download.url);
          return;
        }
        if (download.objectUrl) objectUrl = download.url;
        setOutputName(download.filename);
        setOutputUrl(download.url);
      } catch {
        if (!cancelled) setOutputUrl(null);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, job?.outputFileId, job?.status]);

  useEffect(() => {
    if (job?.status === "failed") {
      setError({
        errorCode: (job.errorCode as ErrorCode) || ERROR_CODES.OUTPUT_FAILED,
        userMessage: job.errorMessage || "Processing failed.",
        action: "Try another image, or sign out and sign in again.",
        retryable: true,
      });
    }
  }, [job?.status, job?.errorCode, job?.errorMessage]);

  if (!tool) {
    return <p>Unknown tool.</p>;
  }

  async function start() {
    setError(null);
    setOutputUrl(null);
    setJobId(null);
    if (!token || !file || !tool) {
      setError(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
    setBusy(true);
    try {
      const presign = await apiFetch<{ fileId: string; uploadUrl: string }>(
        "/uploads/presign",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            mime: file.type,
            size: file.size,
            kind: tool.kind,
          }),
        },
      );
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) {
        setError(describeError(ERROR_CODES.STORAGE_ERROR));
        return;
      }
      const created = await apiFetch<{ jobId: string; status?: string }>(
        "/jobs",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            tool: tool.id,
            inputFileId: presign.fileId,
            parameters: defaultParams(tool.id, scale),
          }),
        },
      );
      setJobId(created.jobId);
      setPreview(URL.createObjectURL(file));
    } catch (caught) {
      const payload = caught as { errorCode?: string; userMessage?: string; action?: string };
      if (payload.errorCode && isErrorCode(payload.errorCode)) {
        setError(describeError(payload.errorCode as ErrorCode));
      } else if (payload.userMessage) {
        setError({
          errorCode: ERROR_CODES.VALIDATION_FAILED,
          userMessage: payload.userMessage,
          action: payload.action ?? "Sign out and sign in again, then retry.",
          retryable: true,
        });
      } else if (caught instanceof TypeError) {
        setError(describeError(ERROR_CODES.STORAGE_ERROR));
      } else {
        setError({
          errorCode: ERROR_CODES.VALIDATION_FAILED,
          userMessage: "Upload or job create failed.",
          action: "Sign out and sign in again. On Vercel, Blob storage must be linked; locally run API + S3.",
          retryable: true,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <p className="text-[12px] uppercase tracking-[0.18em] text-text-subtle">{tool.category}</p>
      <h1 className="font-display mt-8 text-[40px]">{tool.label}</h1>
      <p className="mt-8 max-w-[640px] text-text-muted">{tool.description}</p>
      {tool.comingSoon ? (
        <p className="mt-24 border border-border p-24 text-accent">Coming soon. Frame interpolation is not faked with duplicated frames.</p>
      ) : (
        <div className="mt-32 grid gap-24 lg:grid-cols-[340px_1fr]">
          <div className="flex flex-col gap-16">
            <UploadZone
              accept={tool.kind === "image" ? "image/jpeg,image/png,image/webp,image/avif" : "video/mp4,video/quicktime,video/webm"}
              onFile={(info) => {
                setFile(info.file);
                setDims({ width: info.width, height: info.height });
              }}
            />
            {tool.id === "image.upscale" ? (
              <Field label="Scale" hint={estimate ? `Output ${estimate.width}×${estimate.height}${estimate.withinLimit ? "" : " — exceeds safe limit"}` : undefined}>
                <Select value={scale} onChange={(event) => setScale(Number(event.target.value) as 1 | 2 | 4)}>
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                  <option value={4}>4×</option>
                </Select>
              </Field>
            ) : null}
            {tool.id === "image.upscale" ? (
              <Field label="Model" hint="Lanczos always runs. Real-ESRGAN requires weights on the worker.">
                <Select defaultValue="lanczos" name="model">
                  <option value="lanczos">Lanczos (classical)</option>
                  <option value="realesrgan-x4plus">Real-ESRGAN x4plus</option>
                </Select>
              </Field>
            ) : null}
            <Button onClick={() => void start()} disabled={!file || busy || !token}>
              {busy ? "Working…" : "Process"}
            </Button>
            {error ? (
              <div className="border border-danger p-16">
                <p>{error.userMessage}</p>
                <p className="mt-8 text-[14px] text-text-muted">{error.action}</p>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-16">
            {job ? (
              <JobProgress
                status={job.status}
                stage={job.stage}
                progress={job.progress}
                onCancel={
                  token && jobId
                    ? () => {
                        void apiFetch(`/jobs/${jobId}/cancel`, token, { method: "POST" });
                      }
                    : undefined
                }
              />
            ) : null}
            {preview ? (
              <BeforeAfterViewer beforeSrc={preview} afterSrc={outputUrl ?? preview} />
            ) : (
              <div className="border border-border bg-surface p-48 text-text-muted">Output appears here after the worker finishes.</div>
            )}
            {job?.status === "completed" ? (
              <div className="flex flex-col gap-16">
                <dl className="grid grid-cols-2 gap-12 font-mono text-[12px] uppercase tracking-[0.12em] text-text-muted">
                  <div>Input {job.inputWidth}×{job.inputHeight}</div>
                  <div>Output {job.outputWidth}×{job.outputHeight}</div>
                  <div>In {job.inputSize} B</div>
                  <div>Out {job.outputSize} B</div>
                  <div>Time {job.processingTime} ms</div>
                  <div>Mode {job.processingMode}</div>
                </dl>
                {outputUrl ? (
                  <a
                    className="inline-flex min-h-44 items-center justify-center rounded-[8px] bg-accent px-16 text-[14px] font-medium text-accent-fg"
                    href={outputUrl}
                    download={outputName}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download output
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function defaultParams(tool: string, scale: 1 | 2 | 4): Record<string, unknown> {
  if (tool === "image.upscale") return { scale, model: "lanczos", tileSize: 400, outputFormat: "png", quality: 92 };
  if (tool === "image.restore") return { preset: "balanced", faceRestore: false, upscale: 1, outputFormat: "png" };
  if (tool === "image.face") return { strength: 0.5, upscale: 1, restoreBackground: true, outputFormat: "png" };
  if (tool === "image.background") return { model: "u2net", category: "general", output: "transparent", edgeRefinement: true, outputFormat: "png" };
  if (tool === "image.cleanup") return { denoise: true, deblock: true, sharpen: true, contrast: true, colorCast: true, outputFormat: "png" };
  if (tool === "image.sharpen") return { preset: "balanced", amount: 0.5, radius: 0.9, threshold: 4, outputFormat: "png" };
  if (tool === "image.denoise") return { strength: "medium", outputFormat: "png" };
  if (tool === "image.color") return { exposure: 0, contrast: 10, saturation: 5, highlights: 0, shadows: 8, temperature: 0, tint: 0, outputFormat: "png" };
  if (tool === "image.convert") return { outputFormat: "webp", quality: 90 };
  if (tool === "image.compress") return { outputFormat: "jpg", quality: 75 };
  if (tool.startsWith("video.")) return { outputFormat: "mp4", strength: "medium", model: "ffmpeg-scale", target: "1080p", crf: 28, mode: "single" };
  return {};
}
