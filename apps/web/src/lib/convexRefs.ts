import { makeFunctionReference } from "convex/server";

export const refs = {
  usersMe: makeFunctionReference<"query">("users:me"),
  ensureProfile: makeFunctionReference<"mutation">("users:ensureProfile"),
  updateSettings: makeFunctionReference<"mutation">("users:updateSettings"),
  jobsGet: makeFunctionReference<"query">("jobs:get"),
  jobsList: makeFunctionReference<"query">("jobs:list"),
  jobsRecent: makeFunctionReference<"query">("jobs:recent"),
  usageSnapshot: makeFunctionReference<"query">("usage:snapshot"),
  presetsList: makeFunctionReference<"query">("presets:list"),
  presetsSave: makeFunctionReference<"mutation">("presets:save"),
  adminOverview: makeFunctionReference<"query">("admin:overview"),
};
