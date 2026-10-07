import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getProfile, requireUser, retentionMs } from "./lib";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const profile = await getProfile(ctx, user._id);
    return {
      userId: user._id,
      email: user.email ?? null,
      name: user.name ?? profile?.displayName ?? null,
      role: profile?.role ?? "user",
      plan: profile?.plan ?? "free",
      retention: profile?.retention ?? "7d",
    };
  },
});

export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const existing = await getProfile(ctx, user._id);
    if (existing) {
      return existing._id;
    }
    return await ctx.db.insert("profiles", {
      userId: user._id,
      displayName: user.name,
      role: "user",
      plan: "free",
      retention: "7d",
      createdAt: Date.now(),
    });
  },
});

export const updateSettings = mutation({
  args: {
    displayName: v.optional(v.string()),
    retention: v.optional(
      v.union(v.literal("24h"), v.literal("7d"), v.literal("30d")),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const profile = await getProfile(ctx, user._id);
    if (!profile) {
      throw new Error("NOT_FOUND");
    }
    await ctx.db.patch(profile._id, {
      displayName: args.displayName ?? profile.displayName,
      retention: args.retention ?? profile.retention,
    });
  },
});

export const retentionForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const profile = await getProfile(ctx, user._id);
    const option = profile?.retention ?? "7d";
    return { option, expiresAt: Date.now() + retentionMs(option) };
  },
});
