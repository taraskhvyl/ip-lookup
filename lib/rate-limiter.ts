/**
 * In-memory rate limiter
 */

interface RateRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private map = new Map<string, RateRecord>();

  constructor(
    private limit: number,
    private windowMs: number
  ) {}

  check(key: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = this.map.get(key);

    if (record && now < record.resetAt) {
      if (record.count >= this.limit) {
        return { allowed: false, remaining: 0 };
      }
      record.count++;
      return { allowed: true, remaining: this.limit - record.count };
    }

    this.map.set(key, { count: 1, resetAt: now + this.windowMs });
    return { allowed: true, remaining: this.limit - 1 };
  }
}
