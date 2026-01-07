import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { createSellerSchema } from "./validators"

/**
 * Middleware for /vendor/sellers endpoint
 *
 * Explicitly validates the request body to accept vendor_type and other
 * extended fields that are not part of the core createSellerWorkflow schema.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/vendor/sellers",
      method: "POST",
      middlewares: [
        validateAndTransformBody(createSellerSchema),
      ],
    },
  ],
})
