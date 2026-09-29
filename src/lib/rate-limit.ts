const buckets = new Map<string, number[]>();

/** Sliding-window rate limiter. Returns true when the request is allowed. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const existing = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  if (existing.length >= limit) {
    buckets.set(key, existing);
    return false;
  }
  existing.push(now);
  buckets.set(key, existing);
  if (buckets.size > 2000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => t <= windowStart)) buckets.delete(k);
    }
  }
  return true;
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0]?.trim() || "unknown").slice(0, 64);
}
