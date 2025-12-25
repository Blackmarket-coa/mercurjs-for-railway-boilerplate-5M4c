import { authenticate } from "@medusajs/medusa"
import { validateAndTransformBody, defineMiddlewares } from "@medusajs/framework/http"
import deliveriesMiddlewares from "./deliveries/[id]/middlewares"
import { createDigitalProductsSchema } from "./validation-schemas"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    // Users route with authentication
    {
      method: ["POST"],
      matcher: "/users",
      middlewares: [
        authenticate(["driver", "restaurant"], "bearer", {
          allowUnregistered: true,
        }),
      ],
    },

    // Restaurants routes with authentication
    {
      method: ["POST", "DELETE"],
      matcher: "/restaurants/:id/**",
      middlewares: [
        authenticate(["restaurant", "user"], "bearer"),
      ],
    },

    // Digital products creation route with validation
    {
      matcher: "/admin/digital-products",
      method: "POST",
      middlewares: [
        validateAndTransformBody(createDigitalProductsSchema),
      ],
    },

    // Digital products upload route with multer
    {
      matcher: "/admin/digital-products/upload**",
      method: "POST",
      middlewares: [
        upload.array("files") as any,
      ],
    },

    // Spread deliveries middlewares
    ...deliveriesMiddlewares.routes!,
  ],
})
