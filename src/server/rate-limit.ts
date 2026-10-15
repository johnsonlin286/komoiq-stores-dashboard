import "server-only";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function consumeLoginAttempt(key: string) {
  const now = Date.now();
  pruneExpired(now);

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (current.count >= MAX_ATTEMPTS) {
    return { allowed: false };
  }

  current.count += 1;
  return { allowed: true };
}

export function clearLoginAttempts(key: string) {
  buckets.delete(key);
}

function pruneExpired(now: number) {
  if (buckets.size < 200) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
