import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"
import TicketBookingModuleService from "../../modules/ticket-booking/service"
import { MedusaError } from "@medusajs/framework/utils"

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

    if (!ticketPurchase) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Ticket purchase with id ${input.ticket_purchase_id} not found`
      )
    }

    if (ticketPurchase.status === "scanned") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Ticket has already been scanned"
      )
    }

    return new StepResponse(ticketPurchase)
  }
)
