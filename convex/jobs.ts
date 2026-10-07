import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireUser } from "./lib";
import { Id } from "./_generated/dataModel";

const jobStatus = v.union(
  v.literal("queued"),
  v.literal("validating"),
  v.literal("processing"),
  v.literal("finalizing"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
  v.literal("expired"),
);

export const create = mutation({
  args: {
    tool: v.string(),
    inputFileId: v.id("files"),
    parameters: v.any(),
    cacheKey: v.optional(v.string()),
    processingProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const input = await ctx.db.get(args.inputFileId);
    if (!input || input.userId !== user._id || input.deletedAt) {
      throw new Error("FORBIDDEN");
    }
    if (args.cacheKey) {
      const cached = await ctx.db
        .query("jobs")
        .withIndex("by_cacheKey", (q) => q.eq("cacheKey", args.cacheKey!))
        .order("desc")
        .first();
      if (
        cached &&
        cached.userId === user._id &&
        cached.status === "completed" &&
        cached.outputFileId
      ) {
        return { jobId: cached._id, cacheHit: true };
      }
    }
    const jobId = await ctx.db.insert("jobs", {
      userId: user._id,
      tool: args.tool,
      inputFileId: args.inputFileId,
      status: "queued",
      parameters: args.parameters,
      cacheKey: args.cacheKey,
      createdAt: Date.now(),
      processingProvider: args.processingProvider,
      reservedUsage: true,
      usageCommitted: false,
      inputWidth: input.width,
      inputHeight: input.height,
      inputSize: input.size,
    });
    return { jobId, cacheHit: false };
  },
});

export const get = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) {
      return null;
    }
    const input = await ctx.db.get(job.inputFileId);
    const output = job.outputFileId ? await ctx.db.get(job.outputFileId) : null;
    return { ...job, input, output };
  },
});

export const list = query({
  args: {
    kind: v.optional(v.union(v.literal("image"), v.literal("video"))),
    status: v.optional(jobStatus),
    search: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const limit = Math.min(args.limit ?? 24, 50);
    const rows = await ctx.db
      .query("jobs")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(200);
    const search = args.search?.trim().toLowerCase();
    const filtered = [];
    for (const job of rows) {
      if (args.status && job.status !== args.status) continue;
      const input = await ctx.db.get(job.inputFileId);
      if (args.kind && input && input.kind !== args.kind) continue;
      if (search && input && !input.originalName.toLowerCase().includes(search) && !job.tool.includes(search)) {
        continue;
      }
      filtered.push({
        ...job,
        filename: input?.originalName ?? "file",
        kind: input?.kind ?? "image",
      });
      if (filtered.length >= limit) break;
    }
    return filtered;
  },
});

export const recent = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(8);
    return jobs;
  },
});

export const requestCancel = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) {
      throw new Error("FORBIDDEN");
    }
    if (job.status === "completed" || job.status === "failed" || job.status === "expired") {
      return { cancellable: false, status: job.status };
    }
    await ctx.db.patch(job._id, { status: "cancelled", completedAt: Date.now() });
    return { cancellable: true, status: "cancelled" as const, providerJobId: job.providerJobId };
  },
});

export const remove = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) {
      throw new Error("FORBIDDEN");
    }
    const keys: string[] = [];
    const input = await ctx.db.get(job.inputFileId);
    if (input && input.userId === user._id) {
      keys.push(input.objectKey);
      await ctx.db.patch(input._id, { deletedAt: Date.now() });
    }
    if (job.outputFileId) {
      const output = await ctx.db.get(job.outputFileId);
      if (output && output.userId === user._id) {
        keys.push(output.objectKey);
        await ctx.db.patch(output._id, { deletedAt: Date.now() });
      }
    }
    if (job.maskFileId) {
      const mask = await ctx.db.get(job.maskFileId);
      if (mask && mask.userId === user._id) {
        keys.push(mask.objectKey);
        await ctx.db.patch(mask._id, { deletedAt: Date.now() });
      }
    }
    await ctx.db.delete(job._id);
    return { objectKeys: keys };
  },
});

export const applyProviderUpdate = internalMutation({
  args: {
    jobId: v.string(),
    status: v.string(),
    progress: v.optional(v.number()),
    stage: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    output: v.optional(
      v.object({
        objectKey: v.string(),
        mime: v.string(),
        size: v.number(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        durationMs: v.optional(v.number()),
        hasAudio: v.optional(v.boolean()),
      }),
    ),
    mask: v.optional(
      v.object({
        objectKey: v.string(),
        mime: v.string(),
        size: v.number(),
      }),
    ),
    facesDetected: v.optional(v.number()),
    processingMode: v.optional(v.string()),
    processingTime: v.optional(v.number()),
    processingProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId as Id<"jobs">);
    if (!job) {
      return;
    }
    const patch: Record<string, unknown> = {
      status: args.status,
      progress: args.progress,
      stage: args.stage,
      errorCode: args.errorCode,
      errorMessage: args.errorMessage,
      facesDetected: args.facesDetected,
      processingMode: args.processingMode,
      processingTime: args.processingTime,
      processingProvider: args.processingProvider ?? job.processingProvider,
    };
    if (args.status === "processing" && !job.startedAt) {
      patch.startedAt = Date.now();
    }
    if (args.status === "completed" || args.status === "failed" || args.status === "cancelled") {
      patch.completedAt = Date.now();
    }
    if (args.output) {
      const outputId = await ctx.db.insert("files", {
        userId: job.userId,
        objectKey: args.output.objectKey,
        kind: job.tool.startsWith("video.") ? "video" : "image",
        role: "output",
        mime: args.output.mime,
        size: args.output.size,
        originalName: "output",
        width: args.output.width,
        height: args.output.height,
        durationMs: args.output.durationMs,
        hasAudio: args.output.hasAudio,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      patch.outputFileId = outputId;
      patch.outputWidth = args.output.width;
      patch.outputHeight = args.output.height;
      patch.outputSize = args.output.size;
    }
    if (args.mask) {
      const maskId = await ctx.db.insert("files", {
        userId: job.userId,
        objectKey: args.mask.objectKey,
        kind: "image",
        role: "mask",
        mime: args.mask.mime,
        size: args.mask.size,
        originalName: "mask.png",
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      patch.maskFileId = maskId;
    }
    await ctx.db.patch(job._id, patch);
    if (args.status === "failed" && job.reservedUsage && !job.usageCommitted) {
      await ctx.runMutation(internal.usage.refundReserved, { jobId: job._id });
    }
    if (args.status === "completed" && job.reservedUsage && !job.usageCommitted) {
      await ctx.runMutation(internal.usage.commitReserved, { jobId: job._id });
    }
  },
});
