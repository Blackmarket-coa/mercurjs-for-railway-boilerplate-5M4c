import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"
import type TicketBookingModuleService from "../../modules/ticket-booking/service"

export type VerifyTicketPurchaseStepInput = {
  ticket_purchase_id: string
}

export const verifyTicketPurchaseStep = createStep(
  "verify-ticket-purchase",
  async (input: VerifyTicketPurchaseStepInput, { container }) => {
    const ticketBookingService = container.resolve(
      TICKET_BOOKING_MODULE
    ) as TicketBookingModuleService

    const ticketPurchase = await ticketBookingService.retrieveTicketPurchase(input.ticket_purchase_id)

    if (ticketPurchase.status !== "pending") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Ticket has already been scanned")
    }

    if (ticketPurchase.show_date < new Date()) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Ticket is expired or show date has passed")
    }

    return new StepResponse(true)
  }
)
