import { CreateTicketProductSchema } from "./admin/ticket-products/route"
import { validateAndTransformQuery } from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"import { 
  defineMiddlewares, 
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { CreateTicketProductSchema } from "./admin/ticket-products/route"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/venues",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(CreateVenueSchema),
      ],
    },
  ],
})
export default defineMiddlewares({
  routes: [
    // ...
    {
      matcher: "/admin/venues",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: ["id", "name", "address", "rows.*"],
        }),
      ],
    },export default defineMiddlewares({
  routes: [
    // ...
    {
      matcher: "/admin/ticket-products",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(CreateTicketProductSchema),
      ],
    },
  ],
})
  ],
})
