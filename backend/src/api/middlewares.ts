import { authenticate } from "@medusajs/medusa"
import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework/http"
import deliveriesMiddlewares from "./deliveries/[id]/middlewares"
import { createDigitalProductsSchema } from "./validation-schemas"
import multer from "multer"

// Ticket/Venue Schemas
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { CreateVenueSchema } from "./admin/venues/route"
import { CreateTicketProductSchema } from "./admin/ticket-products/route"
import { GetTicketProductSeatsSchema } from "./store/ticket-products/[id]/seats/route"

const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    // Users route
    {
      method: ["POST"],
      matcher: "/users",
      middlewares: [
        authenticate(["driver", "restaurant"], "bearer", {
          allowUnregistered: true,
        }),
      ],
    },

    // Restaurants routes
    {
      method: ["POST", "DELETE"],
      matcher: "/restaurants/:id/**",
      middlewares: [
        authenticate(["restaurant", "user"], "bearer"),
      ],
    },

    // Digital products creation route
    {
      matcher: "/admin/digital-products",
      method: "POST",
      middlewares: [
        validateAndTransformBody(createDigitalProductsSchema),
      ],
    },

    // Digital products upload route
    {
      matcher: "/admin/digital-products/upload**",
      method: "POST",
      middlewares: [
        upload.array("files") as any,
      ],
    },

    // Ticket/Venue Admin & Store Routes

    // Admin: list venues
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

    // Admin: create venue
    {
      matcher: "/admin/venues",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(CreateVenueSchema),
      ],
    },

    // Admin: list ticket products
    {
      matcher: "/admin/ticket-products",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: ["id", "product_id", "venue_id", "dates", "venue.*", "variants.*", "product.*"],
        }),
      ],
    },

    // Admin: create ticket product
    {
      matcher: "/admin/ticket-products",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(CreateTicketProductSchema),
      ],
    },

    // Store: get ticket product seats
    {
      matcher: "/store/ticket-products/:id/seats",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetTicketProductSeatsSchema, {}),
      ],
    },

    // Deliveries middleware
    ...deliveriesMiddlewares.routes!,
  ],
})
