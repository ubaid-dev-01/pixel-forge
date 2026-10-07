import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

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

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
    retention: v.union(v.literal("24h"), v.literal("7d"), v.literal("30d")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  files: defineTable({
    userId: v.id("users"),
    objectKey: v.string(),
    kind: v.union(v.literal("image"), v.literal("video")),
    role: v.union(v.literal("input"), v.literal("output"), v.literal("preview"), v.literal("mask")),
    mime: v.string(),
    size: v.number(),
    originalName: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    frameCount: v.optional(v.number()),
    codec: v.optional(v.string()),
    hasAudio: v.optional(v.boolean()),
    sha256: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_expiresAt", ["expiresAt"])
    .index("by_objectKey", ["objectKey"]),

  jobs: defineTable({
    userId: v.id("users"),
    tool: v.string(),
    inputFileId: v.id("files"),
    outputFileId: v.optional(v.id("files")),
    maskFileId: v.optional(v.id("files")),
    status: jobStatus,
    progress: v.optional(v.number()),
    stage: v.optional(v.string()),
    parameters: v.any(),
    parameterHash: v.optional(v.string()),
    cacheKey: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    processingProvider: v.optional(v.string()),
    processingMode: v.optional(v.string()),
    processingTime: v.optional(v.number()),
    inputWidth: v.optional(v.number()),
    inputHeight: v.optional(v.number()),
    outputWidth: v.optional(v.number()),
    outputHeight: v.optional(v.number()),
    inputSize: v.optional(v.number()),
    outputSize: v.optional(v.number()),
    facesDetected: v.optional(v.number()),
    providerJobId: v.optional(v.string()),
    reservedUsage: v.optional(v.boolean()),
    usageCommitted: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_status", ["userId", "status"])
    .index("by_status", ["status"])
    .index("by_cacheKey", ["cacheKey"])
    .index("by_providerJobId", ["providerJobId"]),

  usagePeriods: defineTable({
    userId: v.id("users"),
    periodStart: v.number(),
    imageCount: v.number(),
    videoCount: v.number(),
    processingTimeMs: v.number(),
    inputBytes: v.number(),
    outputBytes: v.number(),
    reservedImageCount: v.number(),
    reservedVideoCount: v.number(),
    reservedBytes: v.number(),
    toolUsage: v.any(),
  })
    .index("by_user_period", ["userId", "periodStart"])
    .index("by_user", ["userId"]),

  presets: defineTable({
    userId: v.id("users"),
    tool: v.string(),
    name: v.string(),
    parameters: v.any(),
    createdAt: v.number(),
  }).index("by_user_tool", ["userId", "tool"]),

  auditEvents: defineTable({
    userId: v.optional(v.id("users")),
    actor: v.string(),
    action: v.string(),
    jobId: v.optional(v.id("jobs")),
    fileId: v.optional(v.id("files")),
    requestId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_created", ["createdAt"]),

  providerHealth: defineTable({
    provider: v.string(),
    available: v.boolean(),
    device: v.optional(v.string()),
    interpolationAvailable: v.boolean(),
    models: v.any(),
    reason: v.optional(v.string()),
    checkedAt: v.number(),
  }).index("by_provider", ["provider"]),
});
