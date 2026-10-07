import { Router } from "express";
import { anyApi } from "convex/server";
import { createJobSchema, describeError, presignRequestSchema, toolById } from "@pixelforge/shared";
import { ERROR_CODES, TOOLS, type ToolId } from "@pixelforge/types";
import { z } from "zod";
import type { AuthedRequest } from "./auth.js";
import type { ApiEnv } from "./env.js";
import { objectKey, presignGet, presignPut, deleteObject } from "./storage.js";
import type { S3Client } from "@aws-sdk/client-s3";
import type { ProcessingProvider } from "./providers/index.js";
import { childLogger } from "./logger.js";
import { signPayload, verifyPayload } from "./hmac.js";
import { extensionForMime, sanitizeOriginalName } from "./mime.js";

function parameterHash(tool: string, params: unknown): string {
  return `${tool}:${JSON.stringify(params)}`;
}

export function createRouter(opts: {
  env: ApiEnv;
  s3: S3Client;
  provider: ProcessingProvider;
}): Router {
  const router = Router();
  const { env, s3, provider } = opts;

  router.get("/health", async (_req, res) => {
    const status = await provider.status();
    res.json({
      ok: true,
      service: "pixelforge-api",
      provider: status,
    });
  });

  router.get("/provider", async (_req, res) => {
    res.json(await provider.status());
  });

  router.get("/tools", (_req, res) => {
    res.json({ tools: Object.values(TOOLS) });
  });

  router.post("/uploads/presign", async (req: AuthedRequest, res) => {
    const parsed = presignRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        ...describeError(ERROR_CODES.VALIDATION_FAILED),
        fields: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const convex = req.convex;
    if (!convex) {
      res.status(401).json(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
    const me = (await convex.query(anyApi.users.me, {})) as { userId: string };
    await convex.mutation(anyApi.users.ensureProfile, {});
    const { filename, mime, size, kind } = parsed.data;
    const max = kind === "image" ? env.MAX_IMAGE_BYTES : env.MAX_VIDEO_BYTES;
    if (size > max) {
      res.status(400).json(describeError(ERROR_CODES.FILE_TOO_LARGE));
      return;
    }
    const ext = extensionForMime(mime, kind);
    if (!ext) {
      res.status(400).json(describeError(ERROR_CODES.UNSUPPORTED_FORMAT));
      return;
    }
    const key = objectKey(me.userId, kind, ext);
    const originalName = sanitizeOriginalName(filename);
    const fileId = await convex.mutation(anyApi.files.create, {
      objectKey: key,
      kind,
      role: "input",
      mime,
      size,
      originalName,
    });
    const uploadUrl = await presignPut(s3, env, key, mime);
    res.json({
      fileId,
      objectKey: key,
      uploadUrl,
      expiresIn: env.SIGNED_UPLOAD_TTL_SECONDS,
    });
  });

  router.post("/jobs", async (req: AuthedRequest, res) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        ...describeError(ERROR_CODES.VALIDATION_FAILED),
        fields: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const convex = req.convex;
    if (!convex) {
      res.status(401).json(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
    const tool = parsed.data.tool as ToolId;
    const def = toolById(tool);
    if (def.comingSoon) {
      res.status(400).json(describeError(ERROR_CODES.INTERPOLATION_UNAVAILABLE));
      return;
    }
    const file = (await convex.query(anyApi.files.get, {
      fileId: parsed.data.inputFileId,
    })) as { _id: string; kind: "image" | "video"; size: number; objectKey: string; userId: string; mime: string } | null;
    if (!file) {
      res.status(404).json(describeError(ERROR_CODES.NOT_FOUND));
      return;
    }
    if (file.kind !== def.kind) {
      res.status(400).json(describeError(ERROR_CODES.UNSUPPORTED_FORMAT));
      return;
    }
    const reserved = (await convex.mutation(anyApi.usage.reserve, {
      kind: file.kind,
      bytes: file.size,
    })) as { allowed: boolean };
    if (!reserved.allowed) {
      res.status(402).json(describeError(ERROR_CODES.INSUFFICIENT_USAGE));
      return;
    }
    const status = await provider.status();
    if (!status.available && env.PROCESSING_PROVIDER !== "mock") {
      res.status(503).json(describeError(ERROR_CODES.PROVIDER_UNAVAILABLE));
      return;
    }
    const cacheKey = `${file.objectKey}:${parameterHash(tool, parsed.data.parameters)}`;
    const created = (await convex.mutation(anyApi.jobs.create, {
      tool,
      inputFileId: parsed.data.inputFileId,
      parameters: parsed.data.parameters,
      cacheKey,
      processingProvider: provider.id,
    })) as { jobId: string; cacheHit: boolean };
    if (created.cacheHit) {
      res.json({ jobId: created.jobId, cacheHit: true, status: "completed" });
      return;
    }
    const outputExt = def.kind === "video" ? "mp4" : "png";
    const outputKey = objectKey(String(file.userId), def.kind, outputExt);
    const inputUrl = await presignGet(s3, env, file.objectKey);
    const outputUrl = await presignPut(
      s3,
      env,
      outputKey,
      def.kind === "video" ? "video/mp4" : "image/png",
    );
    const webhookUrl = `${env.API_PUBLIC_URL.replace(/\/$/, "")}/api/webhooks/provider`;
    try {
      const queued = await provider.enqueue({
        jobId: created.jobId,
        tool,
        parameters: { ...parsed.data.parameters, outputObjectKey: outputKey },
        inputUrl,
        outputUrl,
        webhookUrl,
      });
      childLogger({ requestId: req.requestId, jobId: created.jobId, tool, userId: String(file.userId) }).info(
        { provider: provider.id },
        "job.queued",
      );
      res.status(202).json({
        jobId: created.jobId,
        cacheHit: false,
        status: "queued",
        providerJobId: queued.providerJobId,
      });
    } catch {
      res.status(503).json(describeError(ERROR_CODES.PROVIDER_UNAVAILABLE));
    }
  });

  router.get("/jobs/:id", async (req: AuthedRequest, res) => {
    const convex = req.convex;
    if (!convex) {
      res.status(401).json(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
    const job = await convex.query(anyApi.jobs.get, { jobId: req.params.id });
    if (!job) {
      res.status(404).json(describeError(ERROR_CODES.NOT_FOUND));
      return;
    }
    res.json(job);
  });

  router.get("/jobs", async (req: AuthedRequest, res) => {
    const convex = req.convex;
    if (!convex) {
      res.status(401).json(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
    const jobs = await convex.query(anyApi.jobs.list, {
      kind: typeof req.query.kind === "string" ? req.query.kind : undefined,
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
    });
    res.json({ jobs });
  });

  router.post("/jobs/:id/cancel", async (req: AuthedRequest, res) => {
    const convex = req.convex;
    if (!convex) {
      res.status(401).json(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
    const result = (await convex.mutation(anyApi.jobs.requestCancel, {
      jobId: req.params.id,
    })) as { cancellable: boolean; status: string; providerJobId?: string };
    if (result.providerJobId) {
      await provider.cancel(result.providerJobId);
    }
    res.json(result);
  });

  router.delete("/jobs/:id", async (req: AuthedRequest, res) => {
    const convex = req.convex;
    if (!convex) {
      res.status(401).json(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
    const result = (await convex.mutation(anyApi.jobs.remove, {
      jobId: req.params.id,
    })) as { objectKeys: string[] };
    for (const key of result.objectKeys) {
      await deleteObject(s3, env, key);
    }
    res.json({ deleted: true });
  });

  router.get("/files/:id/download", async (req: AuthedRequest, res) => {
    const convex = req.convex;
    if (!convex) {
      res.status(401).json(describeError(ERROR_CODES.UNAUTHORIZED));
      return;
    }
    const file = (await convex.query(anyApi.files.get, { fileId: req.params.id })) as {
      objectKey: string;
      originalName: string;
      mime: string;
    } | null;
    if (!file) {
      res.status(404).json(describeError(ERROR_CODES.NOT_FOUND));
      return;
    }
    const downloadUrl = await presignGet(s3, env, file.objectKey);
    res.json({
      downloadUrl,
      filename: file.originalName,
      mime: file.mime,
      expiresIn: env.SIGNED_DOWNLOAD_TTL_SECONDS,
    });
  });

  router.post("/webhooks/provider", async (req, res) => {
    const raw = (req as AuthedRequest).rawBody ?? JSON.stringify(req.body ?? {});
    const signature = String(req.headers["x-pixelforge-signature"] ?? "");
    const token = String(req.headers.authorization ?? "").replace("Bearer ", "");
    const ok =
      (signature && verifyPayload(env.PROCESSING_WEBHOOK_SECRET, raw, signature)) ||
      (token && token === env.PROCESSING_PROVIDER_TOKEN);
    if (!ok) {
      res.status(401).json(describeError(ERROR_CODES.WEBHOOK_INVALID));
      return;
    }
    const body = z
      .object({
        jobId: z.string(),
        status: z.string(),
        progress: z.number().optional(),
        stage: z.string().optional(),
        errorCode: z.string().optional(),
        errorMessage: z.string().optional(),
        output: z
          .object({
            objectKey: z.string(),
            mime: z.string(),
            size: z.number(),
            width: z.number().optional(),
            height: z.number().optional(),
            durationMs: z.number().optional(),
            hasAudio: z.boolean().optional(),
          })
          .optional(),
        mask: z
          .object({
            objectKey: z.string(),
            mime: z.string(),
            size: z.number(),
          })
          .optional(),
        facesDetected: z.number().optional(),
        processingMode: z.string().optional(),
        processingTime: z.number().optional(),
        processingProvider: z.string().optional(),
      })
      .safeParse(req.body);
    if (!body.success) {
      res.status(400).json(describeError(ERROR_CODES.VALIDATION_FAILED));
      return;
    }
    const site = env.CONVEX_SITE_URL ?? env.CONVEX_URL.replace(".convex.cloud", ".convex.site");
    await fetch(`${site.replace(/\/$/, "")}/internal/jobs/status`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-pixelforge-service": env.API_SERVICE_SECRET,
      },
      body: JSON.stringify(body.data),
    });
    res.json({ ok: true });
  });

  void signPayload;

  return router;
}
