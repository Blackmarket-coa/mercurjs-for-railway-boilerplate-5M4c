import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

/**
 * CORS Middleware for Vendor Routes
 *
 * Applies CORS headers to all vendor routes to allow cross-origin requests
 * from the vendor panel frontend.
 */
const vendorCorsMiddleware = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  // Get allowed origins from environment
  const storeCors = process.env.STORE_CORS || ""
  const vendorCors = process.env.VENDOR_CORS || ""
  const vendorPanelUrl = process.env.VENDOR_PANEL_URL || ""

  // Combine all CORS origins
  const allowedOrigins = [
    ...storeCors.split(",").map(o => o.trim()),
    ...vendorCors.split(",").map(o => o.trim()),
    vendorPanelUrl.trim(),
  ].filter(Boolean)

  const origin = req.headers.origin || ""

  // Check if origin is allowed
  if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    )
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Publishable-API-Key, x-publishable-api-key"
    )
    res.setHeader("Access-Control-Max-Age", "86400") // 24 hours
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendor/*",
      middlewares: [vendorCorsMiddleware],
    },
  ],
})
