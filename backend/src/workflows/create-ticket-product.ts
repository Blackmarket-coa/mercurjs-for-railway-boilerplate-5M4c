import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateVenueAvailabilityStep } from "./steps/validate-venue-availability"
import { createTicketProductsStep } from "./steps/create-ticket-products"
import { useQueryGraphStep, createProductsWorkflow, createRemoteLinkStep, createInventoryItemsWorkflow } from "@medusajs/medusa/core-flows"
import { CreateProductWorkflowInputDTO, CreateMoneyAmountDTO } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { TICKET_BOOKING_MODULE } from "../modules/ticket-booking"
import { RowType } from "../modules/ticket-booking/models/venue-row"
import { createTicketProductVariantsStep } from "./steps/create-ticket-product-variants"

export type CreateTicketProductWorkflowInput = {
  name: string
  venue_id: string
  dates: string[]
  variants: Array<{
    row_type: RowType
    seat_count: number
    prices: CreateMoneyAmountDTO[]
  }>
}

export const createTicketProductWorkflow = createWorkflow(
  "create-ticket-product",
  (input: CreateTicketProductWorkflowInput) => {
    validateVenueAvailabilityStep({
      venue_id: input.venue_id,
      dates: input.dates,
    })

    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["id", "default_location_id", "default_sales_channel_id"],
    })

    // TODO create inventory items for each variant
  }
)
