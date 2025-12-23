import { defineMiddlewares, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import multer from "multer"

// Zod schemas
import { createDigitalProductsSchema } from "./validation-schemas"
import { CreateVenueSchema } from "./admin/venues/route"
import { CreateTicketProductSchema } from "./admin/ticket-products/route"
import { GetTicketProductSeatsSchema } from "./store/ticket-products/[id]/seats/route"

// Memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    // --------------------
    // Digital Products
    // --------------------
    {
      matcher: "/admin/digital-products",
      method: "POST",
      middlewares: [
        validateAndTransformBody(createDigitalProductsSchema),
      ],
    },
    {
      matcher: "/admin/digital-products/upload**",
      method: "POST",
      middlewares: [
        upload.array("files"), // "files" field in multipart/form-data
      ],
    },

    // --------------------
    // Venues
    // --------------------
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
      middlewares: [
        validateAndTransformBody(CreateVenueSchema),
      ],
    },

    // --------------------
    // Ticket Products
    // --------------------
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
    {
      matcher: "/admin/ticket-products",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(CreateTicketProductSchema),
      ],
    },

    // --------------------
    // Store Ticket Product Seats
    // --------------------
    {
      matcher: "/store/ticket-products/:id/seats",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetTicketProductSeatsSchema),
      ],
    },
  ],
})
