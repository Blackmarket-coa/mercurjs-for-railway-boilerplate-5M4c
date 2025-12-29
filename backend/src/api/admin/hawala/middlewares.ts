import {
  authenticate,
  defineMiddlewares,
} from "@medusajs/framework/http"

/**
 * Admin Hawala Routes Authentication Middleware
 * 
 * SECURITY: All admin hawala routes require authenticated admin user
 * This protects financial operations from unauthorized access
 */
export default defineMiddlewares({
  routes: [
    // Protect all admin hawala routes
    {
      matcher: "/admin/hawala/**",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
  ],
})
