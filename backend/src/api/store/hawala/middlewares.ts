import {
  authenticate,
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

/**
 * Simple in-memory rate limiter for store hawala routes
 * 
 * SECURITY: Prevents abuse of financial APIs
 * In production, use Redis-based rate limiting for distributed deployments
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function createRateLimiter(options: { windowMs: number; max: number }) {
  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const customerId = (req as any).auth_context?.actor_id || req.ip
    const key = `${customerId}-${req.path}`
    const now = Date.now()

    let record = rateLimitStore.get(key)
    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + options.windowMs }
      rateLimitStore.set(key, record)
    }

    record.count++
    
    // Set rate limit headers
    res.set("X-RateLimit-Limit", String(options.max))
    res.set("X-RateLimit-Remaining", String(Math.max(0, options.max - record.count)))
    res.set("X-RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)))

    if (record.count > options.max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000)
      res.set("Retry-After", String(retryAfter))
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
        retry_after_seconds: retryAfter,
      })
    }

    next()
  }
}

// Strict rate limiter for financial transactions (5 per minute)
const strictRateLimiter = createRateLimiter({ windowMs: 60_000, max: 5 })

// Standard rate limiter (30 per minute)
const standardRateLimiter = createRateLimiter({ windowMs: 60_000, max: 30 })

/**
 * Store Hawala Routes Middleware
 * 
 * - Authentication: Most routes require customer authentication
 * - Rate Limiting: Financial operations are rate-limited
 */
export default defineMiddlewares({
  routes: [
    // Wallet routes require authentication
    {
      matcher: "/store/hawala/wallet/**",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/hawala/wallet",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    
    // Bank account routes require authentication
    {
      matcher: "/store/hawala/bank-accounts/**",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/hawala/bank-accounts",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    
    // Investment routes require authentication
    {
      matcher: "/store/hawala/investments/**",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/hawala/investments",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    
    // Transaction history requires authentication
    {
      matcher: "/store/hawala/transactions",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    
    // Rate limit deposit operations (5 per minute)
    {
      matcher: "/store/hawala/deposit",
      method: "POST",
      middlewares: [strictRateLimiter as any],
    },
    
    // Rate limit withdrawal operations (5 per minute)
    {
      matcher: "/store/hawala/withdraw",
      method: "POST",
      middlewares: [strictRateLimiter as any],
    },
    
    // Rate limit investments (10 per minute)
    {
      matcher: "/store/hawala/investments",
      method: "POST",
      middlewares: [createRateLimiter({ windowMs: 60_000, max: 10 }) as any],
    },
    
    // Rate limit bank account linking (3 per hour)
    {
      matcher: "/store/hawala/bank-accounts",
      method: "POST",
      middlewares: [createRateLimiter({ windowMs: 3600_000, max: 3 }) as any],
    },
    
    // Standard rate limit for reads
    {
      matcher: "/store/hawala/**",
      method: "GET",
      middlewares: [standardRateLimiter as any],
    },
  ],
})
