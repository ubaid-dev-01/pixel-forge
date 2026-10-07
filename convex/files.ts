import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getProfile, requireUser, retentionMs } from "./lib";

export const create = mutation({
  args: {
    objectKey: v.string(),
    kind: v.union(v.literal("image"), v.literal("video")),
    role: v.union(
      v.literal("input"),
      v.literal("output"),
      v.literal("preview"),
      v.literal("mask"),
    ),
    mime: v.string(),
    size: v.number(),
    originalName: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    sha256: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const profile = await getProfile(ctx, user._id);
    const ttl = retentionMs(profile?.retention ?? "7d");
    return await ctx.db.insert("files", {
      userId: user._id,
      objectKey: args.objectKey,
      kind: args.kind,
      role: args.role,
      mime: args.mime,
      size: args.size,
      originalName: args.originalName,
      width: args.width,
      height: args.height,
      sha256: args.sha256,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  },
});

export const get = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const file = await ctx.db.get(args.fileId);
    if (!file || file.userId !== user._id || file.deletedAt) {
      return null;
    }
    return file;
  },
});

export const markDeleted = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const file = await ctx.db.get(args.fileId);
    if (!file || file.userId !== user._id) {
      throw new Error("FORBIDDEN");
    }
    await ctx.db.patch(file._id, { deletedAt: Date.now() });
    return { objectKey: file.objectKey };
  },
});
