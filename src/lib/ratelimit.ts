import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 100 requests per 10 seconds
// Using Upstash Redis for global state across Edge regions
export const globalRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "10 s"),
    analytics: true,
    prefix: "@tasknest/ratelimit",
});

// Stricter limiter for sensitive API endpoints (e.g. Payments, MFA)
export const sensitiveRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "@tasknest/ratelimit-sensitive",
});
