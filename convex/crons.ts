import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("expire media", { hours: 1 }, internal.cleanup.expireJobs, {});
export default crons;
