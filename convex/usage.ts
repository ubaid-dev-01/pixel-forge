import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentPeriodStart, getProfile, requireUser } from "./lib";
import { Id } from "./_generated/dataModel";

const PLAN_LIMITS = {
  free: { imageJobs: 30, videoJobs: 3, bytes: 1 * 1024 * 1024 * 1024 },
  pro: { imageJobs: 500, videoJobs: 40, bytes: 20 * 1024 * 1024 * 1024 },
  team: { imageJobs: 2000, videoJobs: 200, bytes: 100 * 1024 * 1024 * 1024 },
} as const;

async function getOrCreatePeriod(ctx: { db: any }, userId: Id<"users">) {
  const periodStart = currentPeriodStart();
  const existing = await ctx.db
    .query("usagePeriods")
    .withIndex("by_user_period", (q: any) =>
      q.eq("userId", userId).eq("periodStart", periodStart),
    )
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert("usagePeriods", {
    userId,
    periodStart,
    imageCount: 0,
    videoCount: 0,
    processingTimeMs: 0,
    inputBytes: 0,
    outputBytes: 0,
    reservedImageCount: 0,
    reservedVideoCount: 0,
    reservedBytes: 0,
    toolUsage: {},
  });
  return await ctx.db.get(id);
}

export const snapshot = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const profile = await getProfile(ctx, user._id);
    const plan = profile?.plan ?? "free";
    const limits = PLAN_LIMITS[plan];
    const period = await ctx.db
      .query("usagePeriods")
      .withIndex("by_user_period", (q) =>
        q.eq("userId", user._id).eq("periodStart", currentPeriodStart()),
      )
      .unique();
    return {
      plan,
      periodStart: currentPeriodStart(),
      imageCount: period?.imageCount ?? 0,
      videoCount: period?.videoCount ?? 0,
      processingTimeMs: period?.processingTimeMs ?? 0,
      inputBytes: period?.inputBytes ?? 0,
      outputBytes: period?.outputBytes ?? 0,
      reservedImageCount: period?.reservedImageCount ?? 0,
      reservedVideoCount: period?.reservedVideoCount ?? 0,
      reservedBytes: period?.reservedBytes ?? 0,
      toolUsage: period?.toolUsage ?? {},
      imageLimit: limits.imageJobs,
      videoLimit: limits.videoJobs,
      bytesLimit: limits.bytes,
    };
  },
});

export const reserve = mutation({
  args: {
    kind: v.union(v.literal("image"), v.literal("video")),
    bytes: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const profile = await getProfile(ctx, user._id);
    const plan = profile?.plan ?? "free";
    const limits = PLAN_LIMITS[plan];
    const period = await getOrCreatePeriod(ctx, user._id);
    const nextImages =
      period.imageCount +
      period.reservedImageCount +
      (args.kind === "image" ? 1 : 0);
    const nextVideos =
      period.videoCount +
      period.reservedVideoCount +
      (args.kind === "video" ? 1 : 0);
    const nextBytes = period.inputBytes + period.reservedBytes + args.bytes;
    if (nextImages > limits.imageJobs || nextVideos > limits.videoJobs || nextBytes > limits.bytes) {
      return { allowed: false as const };
    }
    await ctx.db.patch(period._id, {
      reservedImageCount: period.reservedImageCount + (args.kind === "image" ? 1 : 0),
      reservedVideoCount: period.reservedVideoCount + (args.kind === "video" ? 1 : 0),
      reservedBytes: period.reservedBytes + args.bytes,
    });
    return { allowed: true as const };
  },
});

export const commitReserved = internalMutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.usageCommitted) return;
    const period = await getOrCreatePeriod(ctx, job.userId);
    const isVideo = job.tool.startsWith("video.");
    const toolUsage = { ...(period.toolUsage as Record<string, number>) };
    toolUsage[job.tool] = (toolUsage[job.tool] ?? 0) + 1;
    await ctx.db.patch(period._id, {
      imageCount: period.imageCount + (isVideo ? 0 : 1),
      videoCount: period.videoCount + (isVideo ? 1 : 0),
      processingTimeMs: period.processingTimeMs + (job.processingTime ?? 0),
      inputBytes: period.inputBytes + (job.inputSize ?? 0),
      outputBytes: period.outputBytes + (job.outputSize ?? 0),
      reservedImageCount: Math.max(0, period.reservedImageCount - (isVideo ? 0 : 1)),
      reservedVideoCount: Math.max(0, period.reservedVideoCount - (isVideo ? 1 : 0)),
      reservedBytes: Math.max(0, period.reservedBytes - (job.inputSize ?? 0)),
      toolUsage,
    });
    await ctx.db.patch(job._id, { usageCommitted: true, reservedUsage: false });
  },
});

export const refundReserved = internalMutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || !job.reservedUsage || job.usageCommitted) return;
    const period = await getOrCreatePeriod(ctx, job.userId);
    const isVideo = job.tool.startsWith("video.");
    await ctx.db.patch(period._id, {
      reservedImageCount: Math.max(0, period.reservedImageCount - (isVideo ? 0 : 1)),
      reservedVideoCount: Math.max(0, period.reservedVideoCount - (isVideo ? 1 : 0)),
      reservedBytes: Math.max(0, period.reservedBytes - (job.inputSize ?? 0)),
    });
    await ctx.db.patch(job._id, { reservedUsage: false });
  },
});
