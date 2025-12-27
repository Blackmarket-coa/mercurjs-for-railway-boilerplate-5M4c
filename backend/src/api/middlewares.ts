import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

/**
 * Middleware Configuration for Order Cycle Routes
 * 
 * - /vendor/order-cycles/* requires seller authentication
 * - /store/order-cycles/* is public (no auth required)
 * - /admin/order-cycles/* requires admin authentication
 */

export default defineMiddlewares({
  routes: [
    // Vendor routes - require seller authentication
    // MercurJS uses "seller" actor type
    {
      matcher: "/vendor/order-cycles*",
      middlewares: [
        authenticate("seller", ["bearer", "session"]),
      ],
    },
    // Store routes - public, no authentication
    {
      matcher: "/store/order-cycles*",
      middlewares: [],
    },
    // Admin routes - require admin authentication
    {
      matcher: "/admin/order-cycles*",
      middlewares: [
        authenticate("user", ["bearer", "session"]),
      ],
    },
  ],
})
