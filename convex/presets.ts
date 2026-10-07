import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib";

export const list = query({
  args: { tool: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("presets")
      .withIndex("by_user_tool", (q) =>
        args.tool ? q.eq("userId", user._id).eq("tool", args.tool) : q.eq("userId", user._id),
      )
      .collect();
    return rows.filter((row) => row.userId === user._id);
  },
});

export const save = mutation({
  args: {
    tool: v.string(),
    name: v.string(),
    parameters: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db.insert("presets", {
      userId: user._id,
      tool: args.tool,
      name: args.name.slice(0, 80),
      parameters: args.parameters,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { presetId: v.id("presets") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const preset = await ctx.db.get(args.presetId);
    if (!preset || preset.userId !== user._id) {
      throw new Error("FORBIDDEN");
    }
    await ctx.db.delete(preset._id);
  },
});
