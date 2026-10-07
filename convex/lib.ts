import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("UNAUTHORIZED");
  }
  const userId = identity.subject as Id<"users">;
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function getProfile(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);
  const profile = await getProfile(ctx, user._id);
  if (!profile || profile.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return { user, profile };
}

export function currentPeriodStart(now = Date.now()): number {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function retentionMs(option: "24h" | "7d" | "30d"): number {
  if (option === "24h") return 24 * 60 * 60 * 1000;
  if (option === "7d") return 7 * 24 * 60 * 60 * 1000;
  return 30 * 24 * 60 * 60 * 1000;
}
