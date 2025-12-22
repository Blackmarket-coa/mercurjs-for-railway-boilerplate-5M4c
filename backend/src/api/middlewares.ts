import { 
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
