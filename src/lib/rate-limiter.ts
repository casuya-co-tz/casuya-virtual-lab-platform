interface RateLimitInfo {
  count: number
  resetTime: number
}

// In-memory limiter: effective per server instance only. For multi-instance deploys, wire REDIS_URL.
class SimpleRateLimiter {
  private store = new Map<string, RateLimitInfo>()
  private cleanupTimer?: NodeJS.Timeout

  constructor(
    private windowMs: number,
    private maxRequests: number
  ) {
    this.startCleanup()
  }

  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [key, info] of this.store.entries()) {
        if (info.resetTime < now) {
          this.store.delete(key)
        }
      }
    }, 60000)
  }

  private getKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`
  }

  public check(identifier: string, endpoint: string): { allowed: boolean; limit: number; remaining: number; reset: number } {
    const key = this.getKey(identifier, endpoint)
    const now = Date.now()
    let info = this.store.get(key)

    if (!info || info.resetTime < now) {
      info = { count: 0, resetTime: now + this.windowMs }
      this.store.set(key, info)
    }

    const allowed = info.count < this.maxRequests
    if (allowed) {
      info.count++
    }

    return {
      allowed,
      limit: this.maxRequests,
      remaining: this.maxRequests - info.count,
      reset: info.resetTime,
    }
  }

  public stop() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
  }
}

export { SimpleRateLimiter }

export const endpointRateLimiters = {
  '/api/v1': new SimpleRateLimiter(60000, 100),
  '/api/v1/labs': new SimpleRateLimiter(60000, 200),
  '/api/v1/search': new SimpleRateLimiter(60000, 200),
  '/api/v1/public': new SimpleRateLimiter(60000, 30),
}

export const loginLimiter = new SimpleRateLimiter(60000, 10) // 10 attempts per minute per IP
export const signupLimiter = new SimpleRateLimiter(60000, 5) // 5 signups per minute per IP
export const recoveryLimiter = new SimpleRateLimiter(60000, 5) // 5 password resets per minute per IP