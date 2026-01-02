import { defineMiddlewares } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

/**
 * Middleware: Normalize Email to Lowercase
 * 
 * Ensures email signups and logins are case-insensitive by normalizing
 * the email field to lowercase before processing.
 */
async function normalizeEmailMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (req.body && typeof req.body === "object") {
    const body = req.body as Record<string, unknown>
    
    // Normalize email field to lowercase
    if (body.email && typeof body.email === "string") {
      body.email = body.email.toLowerCase().trim()
    }
    
    // Also handle identifier field (used in password reset)
    if (body.identifier && typeof body.identifier === "string") {
      body.identifier = body.identifier.toLowerCase().trim()
    }
  }
  
  next()
}

export default defineMiddlewares({
  routes: [
    // Auth routes - register and login for all actor types
    {
      matcher: "/auth/*",
      middlewares: [normalizeEmailMiddleware],
    },
    // Store customer routes
    {
      matcher: "/store/customers",
      middlewares: [normalizeEmailMiddleware],
    },
    // Vendor seller routes  
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
  ],
})
