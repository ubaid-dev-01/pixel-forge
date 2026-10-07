import { internalMutation } from "./_generated/server";

export const expireJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const files = await ctx.db
      .query("files")
      .withIndex("by_expiresAt", (q) => q.lte("expiresAt", now))
      .take(100);
    const objectKeys: string[] = [];
    for (const file of files) {
      if (file.deletedAt) continue;
      objectKeys.push(file.objectKey);
      await ctx.db.patch(file._id, { deletedAt: now });
    }
    const stale = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "queued"))
      .take(50);
    for (const job of stale) {
      if (now - job.createdAt > 6 * 60 * 60 * 1000) {
        await ctx.db.patch(job._id, { status: "expired", completedAt: now });
      }
    }
    return { objectKeys };
  },
});
