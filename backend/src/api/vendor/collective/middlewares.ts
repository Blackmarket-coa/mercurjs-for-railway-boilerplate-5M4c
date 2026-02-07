import { authenticate, defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendor/collective/**",
      middlewares: [authenticate("seller", ["bearer", "session"])],
    },
  ],
})
