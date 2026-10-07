import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const jobs = await ctx.db.query("jobs").order("desc").take(100);
    const failed = jobs.filter((job) => job.status === "failed");
    const health = await ctx.db.query("providerHealth").collect();
    return {
      recentJobs: jobs.slice(0, 40),
      failedJobs: failed.slice(0, 20),
      health,
    };
  },
});

export const jobs = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("jobs").order("desc").take(100);
    return args.status ? rows.filter((job) => job.status === args.status) : rows;
  },
});

export const recordProviderHealth = internalMutation({
  args: {
    provider: v.string(),
    available: v.boolean(),
    device: v.optional(v.string()),
    interpolationAvailable: v.boolean(),
    models: v.any(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("providerHealth")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .unique();
    const payload = {
      provider: args.provider,
      available: args.available,
      device: args.device,
      interpolationAvailable: args.interpolationAvailable,
      models: args.models,
      reason: args.reason,
      checkedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("providerHealth", payload);
    }
  },
});
