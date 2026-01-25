import { defineMiddlewares, authenticate, validateAndTransformQuery, validateAndTransformBody } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"
import { z } from "zod"

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
 * Combined Security and CORS Middleware
 *
 * Handles both security headers and CORS in the correct order:
 * 1. CORS headers are set first (before security headers)
 * 2. Security headers are relaxed for vendor routes
 * 3. Properly handles preflight OPTIONS requests
 */
async function securityAndCorsMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const isVendorRoute = req.path?.startsWith("/vendor") || false

  // Extract origin from either Origin header or Referer header
  let origin = req.headers.origin || ""
  let referer = req.headers.referer || req.headers.referrer || ""

  // Normalize referer to string if it's an array
  if (Array.isArray(referer)) {
    referer = referer[0] || ""
  }

  // If no origin but we have a referer, extract origin from referer URL
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer)
      origin = `${refererUrl.protocol}//${refererUrl.host}`
    } catch (e) {
      // Invalid referer URL, ignore
    }
  }

  console.log(`[MIDDLEWARE] Path: ${req.path}, Method: ${req.method}`)
  console.log(`[MIDDLEWARE] Origin header: "${req.headers.origin || '(not set)'}"`)
  console.log(`[MIDDLEWARE] Referer header: "${referer || '(not set)'}"`)
  console.log(`[MIDDLEWARE] Computed origin: "${origin}"`)

  // ============================================
  // STEP 1: Handle CORS for vendor routes FIRST
  // ============================================
  if (isVendorRoute) {
    // Get allowed origins from environment
    const storeCors = process.env.STORE_CORS || ""
    const vendorCors = process.env.VENDOR_CORS || ""
    const vendorPanelUrl = process.env.VENDOR_PANEL_URL || ""
    const authCors = process.env.AUTH_CORS || ""
    const adminCors = process.env.ADMIN_CORS || ""

    // Combine all CORS origins
    const allowedOrigins = [
      ...storeCors.split(",").map(o => o.trim()).filter(Boolean),
      ...vendorCors.split(",").map(o => o.trim()).filter(Boolean),
      ...authCors.split(",").map(o => o.trim()).filter(Boolean),
      ...adminCors.split(",").map(o => o.trim()).filter(Boolean),
      vendorPanelUrl.trim(),
    ].filter(Boolean)

    console.log(`[VENDOR CORS] Allowed origins:`, allowedOrigins)

    // Check if origin matches any allowed origin
    let matchedOrigin = ""
    if (origin) {
      // Exact match
      if (allowedOrigins.includes(origin)) {
        matchedOrigin = origin
      }
      // Try without trailing slash
      else if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        matchedOrigin = origin.replace(/\/$/, "")
      }
      // Try with trailing slash
      else if (allowedOrigins.includes(origin + "/")) {
        matchedOrigin = origin + "/"
      }
      // Fallback: Allow known FreeBlackMarket.com domains in production
      // This handles cases where environment variables may not include all subdomains
      else {
        try {
          const originUrl = new URL(origin)
          const hostname = originUrl.hostname.toLowerCase()

          // Allow any *.freeblackmarket.com subdomain
          if (hostname.endsWith('.freeblackmarket.com') || hostname === 'freeblackmarket.com') {
            matchedOrigin = origin
            console.log(`[VENDOR CORS] ✓ Allowed via FreeBlackMarket.com fallback: ${origin}`)
          }
          // Allow Railway preview deployments (*.up.railway.app)
          else if (hostname.endsWith('.up.railway.app')) {
            matchedOrigin = origin
            console.log(`[VENDOR CORS] ✓ Allowed via Railway fallback: ${origin}`)
          }
        } catch (e) {
          // Invalid origin URL, ignore
        }
      }
    }

    // Set CORS headers if origin is allowed
    if (matchedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", matchedOrigin)
      res.setHeader("Access-Control-Allow-Credentials", "true")
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      )
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Publishable-API-Key, x-publishable-api-key, X-Medusa-Access-Token, Cookie"
      )
      res.setHeader("Access-Control-Max-Age", "86400")
      res.setHeader("Vary", "Origin")

      console.log(`[VENDOR CORS] ✓ Headers set for origin: ${matchedOrigin}`)
    } else if (origin) {
      // Only warn if there was an origin that didn't match
      console.warn(`[VENDOR CORS] ✗ Origin not allowed: "${origin}"`)
      console.warn(`[VENDOR CORS] To fix: Add this origin to VENDOR_CORS, STORE_CORS, or AUTH_CORS environment variable`)
      console.warn(`[VENDOR CORS] Allowed origins configured:`, allowedOrigins)
    }

    // Handle preflight OPTIONS requests early
    if (req.method === "OPTIONS") {
      console.log(`[VENDOR CORS] Handling OPTIONS preflight - returning 204`)
      return res.status(204).end()
    }
  }

  // ============================================
  // STEP 2: Apply security headers
  // ============================================
  const isProduction = process.env.NODE_ENV === "production"

  // Relaxed CSP for vendor routes (allow unsafe-eval for development tools)
  if (isVendorRoute) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'self' https:; object-src 'none'"
    )
    console.log(`[SECURITY] Relaxed CSP applied for vendor route`)
  } else {
    // Standard strict CSP for other routes
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' https: data:; connect-src 'self' https://api.stripe.com https://*.algolia.net https://*.algolianet.com wss:; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; object-src 'none'; upgrade-insecure-requests"
    )
  }

  // HSTS (only in production)
  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Other security headers
  res.setHeader("X-Frame-Options", "SAMEORIGIN")
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)")
  res.setHeader("X-DNS-Prefetch-Control", "off")

  // Disable caching for admin/vendor routes
  if (req.path?.startsWith("/admin") || isVendorRoute) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
  }

  next()
}

export default defineMiddlewares({
  routes: [
    // Apply combined security and CORS middleware to all routes
    {
      matcher: "/*",
      middlewares: [securityAndCorsMiddleware],
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
