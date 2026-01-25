import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Catch-all OPTIONS handler for vendor routes
 *
 * This intercepts preflight CORS requests for ALL /vendor/* paths,
 * including those handled by the @mercurjs/b2c-core plugin.
 *
 * The issue: The b2c-core plugin handles vendor routes but doesn't
 * set proper CORS headers for origins like vendor.freeblackmarket.com.
 *
 * This handler ensures preflight requests return proper CORS headers.
 */
export async function OPTIONS(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const origin = req.headers.origin || ""

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

  console.log(`[VENDOR OPTIONS] Path: ${req.path}, Origin: ${origin}`)
  console.log(`[VENDOR OPTIONS] Allowed origins: ${Array.from(allowedOrigins).join(", ")}`)

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
          console.log(`[VENDOR OPTIONS] ✓ Allowed via FreeBlackMarket.com fallback: ${origin}`)
        }
        // Allow Railway preview deployments
        else if (hostname.endsWith(".up.railway.app")) {
          matchedOrigin = origin
          console.log(`[VENDOR OPTIONS] ✓ Allowed via Railway fallback: ${origin}`)
        }
      } catch (e) {
        // Invalid origin URL
      }
    }
  }

  if (matchedOrigin) {
    console.log(`[VENDOR OPTIONS] ✓ Setting CORS headers for origin: ${matchedOrigin}`)

    res.setHeader("Access-Control-Allow-Origin", matchedOrigin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Publishable-API-Key, x-publishable-api-key, X-Medusa-Access-Token, Cookie")
    res.setHeader("Access-Control-Max-Age", "86400")
    res.setHeader("Vary", "Origin")
  } else {
    console.warn(`[VENDOR OPTIONS] ✗ Origin not allowed: "${origin}"`)
  }

  res.status(204).end()
}
