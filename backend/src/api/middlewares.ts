import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

/**
 * Middleware Configuration for Order Cycle Routes
 */
export default defineMiddlewares({
  routes: [
    // Admin routes - require seller authentication (used by vendor panel)
    {
      matcher: "/admin/order-cycles*",
      middlewares: [
        authenticate("seller", ["bearer", "session"]),
      ],
    },
    // Store routes - public, no authentication
    {
      matcher: "/store/order-cycles*",
      middlewares: [],
    },
  ],
})
