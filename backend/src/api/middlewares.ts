import { defineMiddlewares, authenticate, validateAndTransformQuery, validateAndTransformBody } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"
import { parseCorsOrigins } from "@medusajs/framework/utils"
import cors from "cors"
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

const vendorRegistrationRateLimiter = createRateLimiter({
  windowMs: 900_000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes for vendor registration
  keyPrefix: "vendor-reg"
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
 * Build CORS origins string from environment variables
 * Combines VENDOR_CORS, STORE_CORS, AUTH_CORS, ADMIN_CORS, and VENDOR_PANEL_URL
 */
function getVendorCorsOrigins(): string {
  const origins = new Set<string>()

  // Add origins from all CORS environment variables
  const envVars = ['VENDOR_CORS', 'STORE_CORS', 'AUTH_CORS', 'ADMIN_CORS']
  for (const envVar of envVars) {
    const value = process.env[envVar] || ''
    value.split(',').map(o => o.trim()).filter(Boolean).forEach(o => origins.add(o))
  }

  // Add vendor panel URL
  if (process.env.VENDOR_PANEL_URL?.trim()) {
    origins.add(process.env.VENDOR_PANEL_URL.trim())
  }

  // Hardcode production origins to ensure they're always allowed
  origins.add('https://vendor.freeblackmarket.com')
  origins.add('https://freeblackmarket.com')
  origins.add('https://admin.freeblackmarket.com')

  return Array.from(origins).join(',')
}

/**
 * Vendor CORS Middleware
 * Uses the official cors package with parseCorsOrigins for proper CORS handling
 * This handles preflight OPTIONS requests correctly
 */
function vendorCorsMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const origin = req.headers.origin || ''
  console.log(`[VENDOR CORS] Request: ${req.method} ${req.path} from origin: "${origin}"`)

  // Get CORS origins
  const corsOrigins = getVendorCorsOrigins()
  console.log(`[VENDOR CORS] Configured origins: ${corsOrigins}`)

  // Custom origin function to also allow Railway preview deployments
  const customOriginHandler = (
    reqOrigin: string | undefined,
    callback: (err: Error | null, origin?: boolean | string) => void
  ) => {
    if (!reqOrigin) {
      // Allow requests with no origin (like mobile apps or curl)
      callback(null, true)
      return
    }

    // Parse configured origins
    const allowedOrigins = parseCorsOrigins(corsOrigins)

    // Check if origin is in the allowed list
    if (allowedOrigins.includes(reqOrigin) || allowedOrigins.includes(reqOrigin.replace(/\/$/, ''))) {
      console.log(`[VENDOR CORS] ✓ Origin allowed (exact match): ${reqOrigin}`)
      callback(null, true)
      return
    }

    // Check for FreeBlackMarket.com and Railway domains
    try {
      const originUrl = new URL(reqOrigin)
      const hostname = originUrl.hostname.toLowerCase()

      if (hostname.endsWith('.freeblackmarket.com') || hostname === 'freeblackmarket.com') {
        console.log(`[VENDOR CORS] ✓ Origin allowed (FreeBlackMarket.com domain): ${reqOrigin}`)
        callback(null, true)
        return
      }

      if (hostname.endsWith('.up.railway.app')) {
        console.log(`[VENDOR CORS] ✓ Origin allowed (Railway domain): ${reqOrigin}`)
        callback(null, true)
        return
      }
    } catch (e) {
      // Invalid URL, continue to rejection
    }

    console.log(`[VENDOR CORS] ✗ Origin not allowed: ${reqOrigin}`)
    callback(null, false)
  }

  // Apply the cors middleware
  return cors({
    origin: customOriginHandler,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Publishable-API-Key',
      'x-publishable-api-key',
      'X-Medusa-Access-Token',
      'Cookie',
    ],
    maxAge: 86400,
  })(req, res, next)
}

/**
 * Admin CORS Middleware
 * Handles CORS for custom /admin/* routes that aren't handled by Medusa core
 */
function adminCorsMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const origin = req.headers.origin || ''

  // Custom origin function to allow admin dashboards and Railway
  const customOriginHandler = (
    reqOrigin: string | undefined,
    callback: (err: Error | null, origin?: boolean | string) => void
  ) => {
    if (!reqOrigin) {
      callback(null, true)
      return
    }

    // Check for known admin origins
    const adminOrigins = [
      'https://admin.freeblackmarket.com',
      'https://admin-dashboard-production-cc8f.up.railway.app',
    ]

    if (adminOrigins.includes(reqOrigin)) {
      callback(null, true)
      return
    }

    // Check ADMIN_CORS env var
    const envAdminCors = process.env.ADMIN_CORS || ''
    const envOrigins = envAdminCors.split(',').map(o => o.trim()).filter(Boolean)
    if (envOrigins.includes(reqOrigin)) {
      callback(null, true)
      return
    }

    // Allow Railway domains
    try {
      const originUrl = new URL(reqOrigin)
      const hostname = originUrl.hostname.toLowerCase()

      if (hostname.endsWith('.up.railway.app')) {
        callback(null, true)
        return
      }

      if (hostname.endsWith('.freeblackmarket.com') || hostname === 'freeblackmarket.com') {
        callback(null, true)
        return
      }
    } catch (e) {
      // Invalid URL
    }

    callback(null, false)
  }

  return cors({
    origin: customOriginHandler,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Publishable-API-Key',
      'x-publishable-api-key',
      'X-Medusa-Access-Token',
      'Cookie',
    ],
    maxAge: 86400,
  })(req, res, next)
}

/**
 * Security Headers Middleware
 * Applies security headers to all routes
 */
async function securityHeadersMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const isVendorRoute = req.path?.startsWith("/vendor") || false
  const isProduction = process.env.NODE_ENV === "production"

  // Relaxed CSP for vendor routes (allow unsafe-eval for development tools)
  if (isVendorRoute) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'self' https:; object-src 'none'"
    )
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
    // CORS for vendor routes - must be first to handle OPTIONS preflight
    // Using "/vendor*" pattern to match all vendor routes including those from plugins
    {
      matcher: "/vendor*",
      middlewares: [vendorCorsMiddleware],
    },
    // Also match the more specific pattern for local vendor routes
    {
      matcher: "/vendor/*",
      middlewares: [vendorCorsMiddleware],
    },
    // CORS for custom admin routes (requests, sellers, etc.)
    {
      matcher: "/admin/requests*",
      middlewares: [adminCorsMiddleware],
    },
    {
      matcher: "/admin/sellers*",
      middlewares: [adminCorsMiddleware],
    },
    {
      matcher: "/admin/backfill-seller-auth",
      middlewares: [adminCorsMiddleware],
    },
    {
      matcher: "/admin/auth-debug",
      middlewares: [adminCorsMiddleware],
    },
    // Apply security headers to all routes
    {
      matcher: "/*",
      middlewares: [securityHeadersMiddleware],
    },
    // Product feed - public XML feed for Google Shopping/Facebook
    {
      matcher: "/product-feed",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(productFeedQuerySchema, {})
      ],
    },
    // Vendor seller routes - normalize email and rate limit to prevent spam
    {
      matcher: "/vendor/sellers",
      method: "POST",
      middlewares: [vendorRegistrationRateLimiter, normalizeEmailMiddleware],
    },
    // Vendor registration endpoint - dedicated route for seller registration
    // This avoids conflicts with MercurJS's /vendor/sellers route validation
    {
      matcher: "/vendor/register",
      method: "POST",
      middlewares: [vendorRegistrationRateLimiter, normalizeEmailMiddleware],
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
    // Vendor registration status - handles its own token verification to support pending users
    // (removed middleware - endpoint uses AUTHENTICATE = false and verifies token manually)
    // Vendor sellers/me route - seller authentication for profile access
    {
      matcher: "/vendor/sellers/me",
      middlewares: [authenticate("seller", "bearer")],
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
