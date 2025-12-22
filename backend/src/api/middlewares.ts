import { CreateTicketProductSchema } from "./admin/ticket-products/route"
import { CreateVenueSchema } from "./admin/venues/route"
import { validateAndTransformQuery, validateAndTransformBody, defineMiddlewares } from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/venues",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(CreateVenueSchema),
      ],
    },
    {
      matcher: "/admin/venues",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: ["id", "name", "address", "rows.*"],
        }),
      ],
    },
    {
      matcher: "/admin/ticket-products",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: [
            "id", 
            "product_id", 
            "venue_id", 
            "dates", 
            "venue.*", 
            "variants.*", 
            "product.*",
          ],
        }),
      ],
    },
  ],
})
