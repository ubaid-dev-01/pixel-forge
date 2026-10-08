import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getProfile, requireAdmin, requireUser } from "./lib";

const DEFAULT_FLAGS = [
  {
    key: "signup_enabled",
    enabled: true,
    description: "Allow new account registration",
  },
  {
    key: "processing_enabled",
    enabled: true,
    description: "Allow new processing jobs",
  },
  {
    key: "maintenance_mode",
    enabled: false,
    description: "Show maintenance banner / block non-admin workspaces",
  },
] as const;

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const jobs = await ctx.db.query("jobs").order("desc").take(200);
    const profiles = await ctx.db.query("profiles").take(500);
    const health = await ctx.db.query("providerHealth").collect();
    const flags = await ctx.db.query("featureFlags").collect();
    const failed = jobs.filter((job) => job.status === "failed");
    const active = jobs.filter((job) =>
      ["queued", "validating", "processing", "finalizing"].includes(job.status),
    );
    return {
      counts: {
        users: profiles.length,
        admins: profiles.filter((p) => p.role === "admin").length,
        disabled: profiles.filter((p) => p.disabledAt != null).length,
        jobs: jobs.length,
        failed: failed.length,
        active: active.length,
      },
      recentJobs: jobs.slice(0, 25),
      failedJobs: failed.slice(0, 15),
      health,
      flags,
    };
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const profiles = await ctx.db.query("profiles").order("desc").take(200);
    const rows = [];
    for (const profile of profiles) {
      const user = await ctx.db.get(profile.userId);
      rows.push({
        profileId: profile._id,
        userId: profile.userId,
        email: user?.email ?? null,
        name: user?.name ?? profile.displayName ?? null,
        role: profile.role,
        plan: profile.plan,
        retention: profile.retention,
        disabledAt: profile.disabledAt ?? null,
        createdAt: profile.createdAt,
      });
    }
    return rows;
  },
});

export const listJobs = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("jobs").order("desc").take(150);
    return args.status ? rows.filter((job) => job.status === args.status) : rows;
  },
});

export const listFlags = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("featureFlags").collect();
  },
});

export const listHealth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("providerHealth").collect();
  },
});

/** First signed-in user can claim admin if no admin profile exists yet. */
export const claimFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const admins = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .take(1);
    if (admins.length > 0) {
      throw new Error("ADMIN_EXISTS");
    }
    let profile = await getProfile(ctx, user._id);
    if (!profile) {
      const profileId = await ctx.db.insert("profiles", {
        userId: user._id,
        displayName: user.name,
        role: "admin",
        plan: "team",
        retention: "30d",
        createdAt: Date.now(),
      });
      profile = await ctx.db.get(profileId);
    } else {
      await ctx.db.patch(profile._id, { role: "admin" });
    }
    for (const flag of DEFAULT_FLAGS) {
      const existing = await ctx.db
        .query("featureFlags")
        .withIndex("by_key", (q) => q.eq("key", flag.key))
        .unique();
      if (!existing) {
        await ctx.db.insert("featureFlags", {
          key: flag.key,
          enabled: flag.enabled,
          description: flag.description,
          updatedAt: Date.now(),
          updatedBy: user._id,
        });
      }
    }
    return { ok: true as const };
  },
});

export const setUserRole = mutation({
  args: {
    profileId: v.id("profiles"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("NOT_FOUND");
    if (profile.userId === user._id && args.role !== "admin") {
      throw new Error("CANNOT_DEMOTE_SELF");
    }
    await ctx.db.patch(profile._id, { role: args.role });
  },
});

export const setUserPlan = mutation({
  args: {
    profileId: v.id("profiles"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("NOT_FOUND");
    await ctx.db.patch(profile._id, { plan: args.plan });
  },
});

export const setUserDisabled = mutation({
  args: {
    profileId: v.id("profiles"),
    disabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);
    const profile = await ctx.db.get(args.profileId);
    if (!profile) throw new Error("NOT_FOUND");
    if (profile.userId === user._id && args.disabled) {
      throw new Error("CANNOT_DISABLE_SELF");
    }
    await ctx.db.patch(profile._id, {
      disabledAt: args.disabled ? Date.now() : null,
    });
  },
});

export const cancelJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("NOT_FOUND");
    if (["completed", "failed", "cancelled", "expired"].includes(job.status)) {
      return { ok: false as const, status: job.status };
    }
    await ctx.db.patch(job._id, {
      status: "cancelled",
      completedAt: Date.now(),
      errorCode: "ADMIN_CANCELLED",
      errorMessage: "Cancelled by admin",
    });
    return { ok: true as const, status: "cancelled" as const };
  },
});

export const setFlag = mutation({
  args: {
    key: v.string(),
    enabled: v.boolean(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("featureFlags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        description: args.description ?? existing.description,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
      return existing._id;
    }
    return await ctx.db.insert("featureFlags", {
      key: args.key,
      enabled: args.enabled,
      description: args.description,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });
  },
});

export const seedFlags = mutation({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAdmin(ctx);
    for (const flag of DEFAULT_FLAGS) {
      const existing = await ctx.db
        .query("featureFlags")
        .withIndex("by_key", (q) => q.eq("key", flag.key))
        .unique();
      if (!existing) {
        await ctx.db.insert("featureFlags", {
          key: flag.key,
          enabled: flag.enabled,
          description: flag.description,
          updatedAt: Date.now(),
          updatedBy: user._id,
        });
      }
    }
    return { ok: true as const };
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
