import { defineMiddlewares, authenticate, validateAndTransformQuery, validateAndTransformBody } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"
import { z } from "zod"
import { defaultSecurityHeaders } from "../shared/security-headers"

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Rate Limiter Store - In-memory rate limiting
 * For production, consider using Redis for distributed rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Create a rate limiter middleware
 * @param windowMs - Time window in milliseconds
 * @param max - Maximum requests per window
 */
function createRateLimiter(options: { windowMs: number; max: number; keyPrefix?: string }) {
  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown"
    const key = `${options.keyPrefix || "default"}:${ip}`
    const now = Date.now()
    
    let record = rateLimitStore.get(key)
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + options.windowMs }
      rateLimitStore.set(key, record)
    }
    
    record.count++
    
    // Set rate limit headers
    res.set("X-RateLimit-Limit", String(options.max))
    res.set("X-RateLimit-Remaining", String(Math.max(0, options.max - record.count)))
    res.set("X-RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)))
    
    if (record.count > options.max) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
        type: "rate_limit_exceeded",
        retry_after: Math.ceil((record.resetAt - now) / 1000)
      })
    }
    
    next()
  }
}

// Rate limiters for different endpoints
const authRateLimiter = createRateLimiter({ 
  windowMs: 60_000, // 1 minute
  max: 10, // 10 attempts per minute per IP
  keyPrefix: "auth"
})

const strictAuthRateLimiter = createRateLimiter({ 
  windowMs: 300_000, // 5 minutes
  max: 5, // 5 attempts per 5 minutes for password reset
  keyPrefix: "auth-strict"
})

/**
 * Middleware: Normalize and Validate Email
 *
 * Ensures email signups and logins are case-insensitive by normalizing
 * the email field to lowercase before processing. Also validates email format.
 */
async function normalizeEmailMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (req.body && typeof req.body === "object") {
    const body = req.body as Record<string, unknown>

    // Normalize and validate email field
    if (body.email && typeof body.email === "string") {
      const normalizedEmail = body.email.toLowerCase().trim()

      // Validate email format
      if (!EMAIL_REGEX.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Invalid email format",
          type: "invalid_data"
        })
      }

      body.email = normalizedEmail
    }

    // Also handle identifier field (used in password reset)
    if (body.identifier && typeof body.identifier === "string") {
      body.identifier = body.identifier.toLowerCase().trim()
    }
  }

  next()
}

// Product feed query validation schema
const productFeedQuerySchema = z.object({
  currency_code: z.string().length(3).optional().default("usd"),
  country_code: z.string().min(2).max(3).optional().default("us"),
})

// Rental configuration body schema
const PostRentalConfigBodySchema = z.object({
  min_rental_days: z.number().optional(),
  max_rental_days: z.number().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

// Rental status body schema
const PostRentalStatusBodySchema = z.object({
  status: z.enum(["active", "returned", "cancelled"]),
})

// Rental availability query schema
const GetRentalAvailabilitySchema = z.object({
  variant_id: z.string(),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "start_date must be a valid date string (YYYY-MM-DD)",
  }),
  end_date: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Date.parse(val)), {
      message: "end_date must be a valid date string (YYYY-MM-DD)",
    }),
  currency_code: z.string().optional(),
})

// Cart rental items body schema
const PostCartItemsRentalsBody = z.object({
  variant_id: z.string(),
  quantity: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * CORS Middleware for Vendor Routes
 *
 * Applies CORS headers to all vendor routes to allow cross-origin requests
 * from the vendor panel frontend.
 */
async function vendorCorsMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Only process vendor routes
  if (!req.path?.startsWith("/vendor")) {
    return next()
  }

  const origin = req.headers.origin || ""

  // Get allowed origins from environment
  const storeCors = process.env.STORE_CORS || ""
  const vendorCors = process.env.VENDOR_CORS || ""
  const vendorPanelUrl = process.env.VENDOR_PANEL_URL || ""
  const authCors = process.env.AUTH_CORS || ""

  // Combine all CORS origins
  const allowedOrigins = [
    ...storeCors.split(",").map(o => o.trim()).filter(Boolean),
    ...vendorCors.split(",").map(o => o.trim()).filter(Boolean),
    ...authCors.split(",").map(o => o.trim()).filter(Boolean),
    vendorPanelUrl.trim(),
  ].filter(Boolean)

  // Log for debugging (remove in production)
  console.log(`[VENDOR CORS] Path: ${req.path}`)
  console.log(`[VENDOR CORS] Origin: ${origin}`)
  console.log(`[VENDOR CORS] Allowed origins:`, allowedOrigins)
  console.log(`[VENDOR CORS] Method: ${req.method}`)

  // Always set CORS headers for vendor routes if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    )
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Publishable-API-Key, x-publishable-api-key, X-Medusa-Access-Token"
    )
    res.setHeader("Access-Control-Max-Age", "86400")

    console.log(`[VENDOR CORS] Headers set for origin: ${origin}`)
  } else {
    console.warn(`[VENDOR CORS] Origin not allowed: ${origin}`)
  }

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    console.log(`[VENDOR CORS] Handling OPTIONS preflight request`)
    return res.status(204).end()
  }

  next()
}

export default defineMiddlewares({
  routes: [
    // Apply security headers and vendor CORS to all routes
    {
      matcher: "/*",
      middlewares: [defaultSecurityHeaders, vendorCorsMiddleware],
    },
    // Product feed - public XML feed for Google Shopping/Facebook
    {
      matcher: "/product-feed",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(productFeedQuerySchema, {})
      ],
    },
    // Vendor seller routes - normalize email only, validation done in route handler
    {
      matcher: "/vendor/sellers",
      method: "POST",
      middlewares: [normalizeEmailMiddleware],
    },
    // Auth routes - register and login for all actor types (rate limited)
    {
      matcher: "/auth/*",
      middlewares: [authRateLimiter, normalizeEmailMiddleware],
    },
    // Password reset - stricter rate limit
    {
      matcher: "/auth/*/reset-password",
      method: "POST",
      middlewares: [strictAuthRateLimiter, normalizeEmailMiddleware],
    },
    // Store customer routes
    {
      matcher: "/store/customers",
      middlewares: [authRateLimiter, normalizeEmailMiddleware],
    },
    // Admin user routes
    {
      matcher: "/admin/users",
      middlewares: [normalizeEmailMiddleware],
    },
    // Admin invite routes
    {
      matcher: "/admin/invites",
      middlewares: [normalizeEmailMiddleware],
    },
    // Vendor delivery routes - seller authentication
    {
      matcher: "/vendor/deliveries/*",
      middlewares: [authenticate("seller", "bearer")],
    },
    {
      matcher: "/vendor/delivery-zones/*",
      middlewares: [authenticate("seller", "bearer")],
    },
    // Driver routes - driver authentication
    {
      matcher: "/driver/*",
      middlewares: [authenticate("driver", "bearer")],
    },
    // Courier routes for food distribution
    {
      matcher: "/store/couriers/me/*",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    // Store subscription routes - customer authentication
    {
      matcher: "/store/subscriptions",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/subscriptions/*",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    // Vendor subscription routes - seller authentication
    {
      matcher: "/vendor/subscriptions",
      middlewares: [authenticate("seller", "bearer")],
    },
    {
      matcher: "/vendor/subscriptions/*",
      middlewares: [authenticate("seller", "bearer")],
    },
    // Rental routes - admin
    {
      matcher: "/admin/products/:id/rental-config",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostRentalConfigBodySchema)
      ]
    },
    {
      matcher: "/admin/rentals/:id",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostRentalStatusBodySchema)
      ]
    },
    // Rental routes - store
    {
      matcher: "/store/products/:id/rental-availability",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetRentalAvailabilitySchema, {})
      ]
    },
    {
      matcher: "/store/carts/:id/line-items/rentals",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostCartItemsRentalsBody)
      ]
    },
  ],
})
