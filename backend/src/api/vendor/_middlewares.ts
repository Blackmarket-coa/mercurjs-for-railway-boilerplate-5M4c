import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

/**
 * Vendor-specific CORS middleware
 *
 * This middleware handles CORS for all /vendor/* routes, including those
 * handled by the @mercurjs/b2c-core plugin.
 *
 * Placed in src/api/vendor/ to ensure it runs for all vendor routes.
 */
async function vendorCorsMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): Promise<void> {
  const origin = req.headers.origin || ""

  console.log(`[VENDOR CORS MW] Path: ${req.path}, Method: ${req.method}, Origin: ${origin}`)

  // Get allowed origins from environment
  const vendorCors = process.env.VENDOR_CORS || ""
  const storeCors = process.env.STORE_CORS || ""
  const authCors = process.env.AUTH_CORS || ""

  // Build list of allowed origins
  const allowedOrigins = new Set<string>()

  vendorCors.split(",").map(o => o.trim()).filter(Boolean).forEach(o => allowedOrigins.add(o))
  storeCors.split(",").map(o => o.trim()).filter(Boolean).forEach(o => allowedOrigins.add(o))
  authCors.split(",").map(o => o.trim()).filter(Boolean).forEach(o => allowedOrigins.add(o))

  // Always allow freeblackmarket.com domains
  allowedOrigins.add("https://vendor.freeblackmarket.com")
  allowedOrigins.add("https://freeblackmarket.com")
  allowedOrigins.add("https://www.freeblackmarket.com")

  let matchedOrigin = ""

  if (origin) {
    // Exact match
    if (allowedOrigins.has(origin)) {
      matchedOrigin = origin
    }
    // Try without trailing slash
    else if (allowedOrigins.has(origin.replace(/\/$/, ""))) {
      matchedOrigin = origin.replace(/\/$/, "")
    }
    // Fallback: Allow known domains
    else {
      try {
        const originUrl = new URL(origin)
        const hostname = originUrl.hostname.toLowerCase()

        // Allow any *.freeblackmarket.com subdomain
        if (hostname.endsWith(".freeblackmarket.com") || hostname === "freeblackmarket.com") {
          matchedOrigin = origin
          console.log(`[VENDOR CORS MW] ✓ Allowed via FreeBlackMarket.com fallback: ${origin}`)
        }
        // Allow Railway preview deployments
        else if (hostname.endsWith(".up.railway.app")) {
          matchedOrigin = origin
          console.log(`[VENDOR CORS MW] ✓ Allowed via Railway fallback: ${origin}`)
        }
      } catch (e) {
        // Invalid origin URL
      }
    }
  }

  if (matchedOrigin) {
    console.log(`[VENDOR CORS MW] ✓ Setting CORS headers for origin: ${matchedOrigin}`)

    res.setHeader("Access-Control-Allow-Origin", matchedOrigin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Publishable-API-Key, x-publishable-api-key, X-Medusa-Access-Token, Cookie")
    res.setHeader("Access-Control-Max-Age", "86400")
    res.setHeader("Vary", "Origin")
  } else if (origin) {
    console.warn(`[VENDOR CORS MW] ✗ Origin not allowed: "${origin}"`)
  }

  // Handle preflight
  if (req.method === "OPTIONS") {
    console.log(`[VENDOR CORS MW] Handling OPTIONS preflight - returning 204`)
    res.status(204).end()
    return
  }

  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendor/**",
      middlewares: [vendorCorsMiddleware],
    },
  ],
})
