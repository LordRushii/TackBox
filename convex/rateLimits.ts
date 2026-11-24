import { internalMutation, MutationCtx, QueryCtx } from "./_generated/server";

// Fixed-window counters in the rateLimits table. Every limit the backend enforces is named in
// RATE_LIMITS, so each budget and window sits in one place. Keys arrive already hashed by the
// Next.js server (lib/rate-keys.ts), so no raw IPs, emails or user IDs are stored.

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export const RATE_LIMITS = {
  // Login attempts per client, across all emails: stops one machine spraying passwords
  login: { max: 30, windowMs: 15 * MINUTE },
  // Failed logins per client + email, so a stranger on another network can't lock you out
  "login-fail": { max: 10, windowMs: 15 * MINUTE },
  // Sign-ups per client, taken emails included, which caps how fast addresses can be probed
  signup: { max: 5, windowMs: 60 * MINUTE },
  // A view or download of a skill counts once per viewer per day
  views: { max: 1, windowMs: DAY },
  downloads: { max: 1, windowMs: DAY },
} as const;

export type RateLimit = keyof typeof RATE_LIMITS;

type Reader = { db: QueryCtx["db"] };
type Writer = { db: MutationCtx["db"] };

async function row(ctx: Reader, limit: RateLimit, key: string) {
  return await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", `${limit}:${key}`))
    .unique();
}

/** Whether `key` has used up its budget for `limit`, without using any of it. */
export async function isSpent(ctx: Reader, limit: RateLimit, key: string): Promise<boolean> {
  const current = await row(ctx, limit, key);
  const count = current && current.expiresAt > Date.now() ? current.count : 0;
  return count >= RATE_LIMITS[limit].max;
}

/**
 * Uses one unit of `key`'s budget for `limit`. Returns false once the budget is spent.
 * Runs inside the caller's mutation, so a mutation that throws afterwards takes the hit
 * back with it: return a result instead of throwing when the hit has to stick.
 */
export async function consume(ctx: Writer, limit: RateLimit, key: string): Promise<boolean> {
  const { max, windowMs } = RATE_LIMITS[limit];
  const now = Date.now();
  const current = await row(ctx, limit, key);

  if (current && current.expiresAt > now) {
    await ctx.db.patch(current._id, { count: current.count + 1 });
    return current.count + 1 <= max;
  }
  const fresh = { count: 1, windowStart: now, expiresAt: now + windowMs };
  if (current) await ctx.db.patch(current._id, fresh);
  else await ctx.db.insert("rateLimits", { key: `${limit}:${key}`, ...fresh });
  return 1 <= max;
}

/** Gives `key` its whole budget for `limit` back. */
export async function reset(ctx: Writer, limit: RateLimit, key: string) {
  const current = await row(ctx, limit, key);
  if (current) await ctx.db.delete(current._id);
}

/** Deletes expired windows. Runs hourly from crons.ts. */
export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", Date.now()))
      .take(1000);
    for (const r of expired) await ctx.db.delete(r._id);
    return expired.length;
  },
});
