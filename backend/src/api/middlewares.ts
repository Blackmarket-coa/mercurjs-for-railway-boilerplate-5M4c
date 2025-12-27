import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendor/order-cycles*",
      middlewares: [
        authenticate("seller", ["bearer", "session"]),
      ],
    },
    {
      matcher: "/store/order-cycles*",
      middlewares: [],
    },
  ],
})
