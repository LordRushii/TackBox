import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("clear expired rate limits", { hours: 1 }, internal.rateLimits.cleanup, {});

export default crons;
