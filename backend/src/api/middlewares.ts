import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { CreateVenueSchema } from "../../admin/venues/route"
import { CreateTicketProductSchema } from "../../admin/ticket-products/route"
import { GetTicketProductSeatsSchema } from "../../store/ticket-products/[id]/seats/route"

// Corrected paths to utils
import { isDeliveryRestaurant } from "../../../utils/is-delivery-restaurant"
import { isDeliveryDriver } from "../../../utils/is-delivery-driver"

// Medusa modules: make sure these are installed via pnpm
// pnpm add @medusajs/cart @medusajs/order @medusajs/product
import CartModule from "@medusajs/cart"
import OrderModule from "@medusajs/order"
import ProductModule from "@medusajs/product"

export default defineMiddlewares({
  routes: [
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
      matcher: "/admin/venues",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(CreateVenueSchema)],
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
    {
      matcher: "/admin/ticket-products",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(CreateTicketProductSchema)],
    },
    {
      matcher: "/store/ticket-products/:id/seats",
      methods: ["GET"],
      middlewares: [validateAndTransformQuery(GetTicketProductSeatsSchema, {})],
    },
  ],
})
