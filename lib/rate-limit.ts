// Tiny in-memory limiter (per server instance). Good enough for login / enquiry abuse.
const g = globalThis as unknown as { __rl?: Map<string, number[]> };
const hits: Map<string, number[]> = (g.__rl ??= new Map());

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}

export const resetRateLimit = (key: string) => hits.delete(key);
