import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

/**
 * Rate Limiter Store - In-memory rate limiting
 * For production with multiple instances, consider using Redis
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum requests per window */
  max: number
  /** Key prefix for namespacing different rate limiters */
  keyPrefix?: string
  /** Custom key generator function */
  keyGenerator?: (req: MedusaRequest) => string
}

/**
 * Create a rate limiter middleware
 * 
 * @example
 * ```typescript
 * // 10 requests per minute
 * const authRateLimiter = createRateLimiter({ 
 *   windowMs: 60_000, 
 *   max: 10, 
 *   keyPrefix: "auth" 
 * })
 * ```
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, keyPrefix = "default", keyGenerator } = options

  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const ip = keyGenerator 
      ? keyGenerator(req)
      : req.ip || (req.headers["x-forwarded-for"] as string) || "unknown"
    
    const key = `${keyPrefix}:${ip}`
    const now = Date.now()

    let record = rateLimitStore.get(key)
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs }
      rateLimitStore.set(key, record)
    }

    record.count++

    // Set rate limit headers
    res.set("X-RateLimit-Limit", String(max))
    res.set("X-RateLimit-Remaining", String(Math.max(0, max - record.count)))
    res.set("X-RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)))

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000)
      res.set("Retry-After", String(retryAfter))
      
      return res.status(429).json({
        message: "Too many requests, please try again later",
        type: "rate_limit_exceeded",
        retry_after: retryAfter,
      })
    }

    next()
  }
}

// Pre-configured rate limiters for common use cases

/** Standard rate limiter: 30 requests per minute */
export const standardRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  keyPrefix: "standard",
})

/** Auth rate limiter: 10 attempts per minute */
export const authRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  keyPrefix: "auth",
})

/** Strict auth rate limiter: 5 attempts per 5 minutes (for password reset, etc.) */
export const strictAuthRateLimiter = createRateLimiter({
  windowMs: 300_000,
  max: 5,
  keyPrefix: "auth-strict",
})

/** Upload rate limiter: 10 uploads per hour */
export const uploadRateLimiter = createRateLimiter({
  windowMs: 3600_000,
  max: 10,
  keyPrefix: "upload",
})
