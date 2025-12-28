import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createTicketProductWorkflow } from "../../../workflows/create-ticket-product"
import { RowType } from "../../../modules/ticket-booking/models/venue-row"
import { z } from "zod"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")
  const sellerId = (req as any).auth_context?.actor_id

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const {
      data: ticketProducts,
      metadata
    } = await query.graph({
      entity: "ticket_product",
      fields: ["*", "venue.*", "product.*"],
      filters: {
        seller_id: sellerId
      },
    })

    res.json({
      ticket_products: ticketProducts,
      count: metadata?.count,
      limit: metadata?.take,
      offset: metadata?.skip,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch ticket products", error: error.message })
  }
}

export const CreateTicketProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  venue_id: z.string().min(1, "Venue ID is required"),
  dates: z.array(z.string()).min(1, "At least one date is required"),
  variants: z.array(z.object({
    row_type: z.nativeEnum(RowType),
    seat_count: z.number().min(1, "Seat count must be at least 1"),
    prices: z.array(z.object({
      currency_code: z.string().min(1, "Currency code is required"),
      amount: z.number().min(0, "Amount must be non-negative"),
      min_quantity: z.number().optional(),
      max_quantity: z.number().optional()
    })).min(1, "At least one price is required")
  })).min(1, "At least one variant is required")
})

type CreateTicketProductSchema = z.infer<typeof CreateTicketProductSchema>

export async function POST(
  req: MedusaRequest<CreateTicketProductSchema>,
  res: MedusaResponse
) {
  const sellerId = (req as any).auth_context?.actor_id

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { result } = await createTicketProductWorkflow(req.scope).run({
      input: {
        ...req.body,
        seller_id: sellerId
      }
    })

    res.status(201).json(result)
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create ticket product", error: error.message })
  }
}
