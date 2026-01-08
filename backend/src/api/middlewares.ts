import { defineMiddlewares, authenticate } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

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

/**
 * Middleware: Handle Vendor Type Field
 *
 * Extracts vendor_type and other extended fields from the request body
 * before Medusa's automatic validation sees them, then restores them
 * for the route handler to use.
 *
 * CRITICAL: This must run BEFORE any body parsing/validation middleware
 */
async function handleVendorTypeField(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  console.log('[handleVendorTypeField] Middleware called for:', req.method, req.path);

  // Only process for POST requests to /vendor/sellers
  if (req.method === 'POST' && req.path === '/vendor/sellers') {
    console.log('[handleVendorTypeField] Processing vendor/sellers POST request');
    console.log('[handleVendorTypeField] Original body keys:', Object.keys(req.body || {}));

    // Access raw body before it's parsed and validated
    const rawBody = req.body;

    if (rawBody && typeof rawBody === "object") {
      const body = rawBody as Record<string, any>;

      // Extract extended fields that aren't part of the core seller workflow
      const extendedFields: Record<string, any> = {
        vendor_type: body.vendor_type,
        website_url: body.website_url,
        social_links: body.social_links,
      };

      console.log('[handleVendorTypeField] Extracted fields:', extendedFields);

      // Store extended fields in request for route handler to access
      (req as any).extendedFields = extendedFields;

      // Remove from body to prevent auto-validation errors
      delete body.vendor_type;
      delete body.website_url;
      delete body.social_links;

      console.log('[handleVendorTypeField] Modified body keys:', Object.keys(body));
    }
  }

  next();
}

export default defineMiddlewares({
  routes: [
    // CRITICAL: This MUST be first to run before any validation
    // Handle vendor_type field extraction for /vendor/sellers
    {
      matcher: "/vendor/sellers",
      method: "POST",
      middlewares: [handleVendorTypeField],
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
    // Vendor seller routes - normalize email (vendor_type handled above)
    {
      matcher: "/vendor/sellers",
      middlewares: [normalizeEmailMiddleware],
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
  ],
})
