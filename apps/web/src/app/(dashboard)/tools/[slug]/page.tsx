"use client";

import { use, useMemo, useState } from "react";
import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { toolBySlug, describeError } from "@pixelforge/shared";
import { ERROR_CODES, type ErrorCode } from "@pixelforge/types";
import { UploadZone } from "@/components/media/UploadZone";
import { BeforeAfterViewer } from "@/components/media/BeforeAfterViewer";
import { JobProgress } from "@/components/jobs/JobProgress";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { apiFetch } from "@/lib/api";
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
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const job = useQuery(refs.jobsGet, jobId ? { jobId } : "skip");

  const estimate = useMemo(() => {
    if (!dims.width || !dims.height) return null;
    return estimatedUpscaleSize(dims.width, dims.height, scale);
  }, [dims, scale]);

  if (!tool) {
    return <p>Unknown tool.</p>;
  }

  async function start() {
    setError(null);
    if (!token || !file || !tool) {
      setError(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
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
        headers: { "content-type": file.type },
        body: file,
      });
      if (!put.ok) {
        setError(describeError(ERROR_CODES.STORAGE_ERROR));
        return;
      }
      const created = await apiFetch<{ jobId: string }>(
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
      const payload = caught as { errorCode?: string };
      if (payload.errorCode && isErrorCode(payload.errorCode)) {
        setError(describeError(payload.errorCode as ErrorCode));
      } else {
        setError(describeError(ERROR_CODES.PROVIDER_UNAVAILABLE));
      }
    }
  }

  const outputUrl = job?.output ? undefined : undefined;

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
            <Button onClick={() => void start()} disabled={!file}>
              Process
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
              <dl className="grid grid-cols-2 gap-12 font-mono text-[12px] uppercase tracking-[0.12em] text-text-muted">
                <div>Input {job.inputWidth}×{job.inputHeight}</div>
                <div>Output {job.outputWidth}×{job.outputHeight}</div>
                <div>In {job.inputSize} B</div>
                <div>Out {job.outputSize} B</div>
                <div>Time {job.processingTime} ms</div>
                <div>Mode {job.processingMode}</div>
              </dl>
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
