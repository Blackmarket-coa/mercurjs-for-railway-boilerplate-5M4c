import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"
import TicketBookingModuleService from "../../modules/ticket-booking/service"

export type CreateVenueStepInput = {
  name: string
  address?: string
  seller_id: string
}

export const createVenueStep = createStep(
  "create-venue",
  async (input: CreateVenueStepInput, { container }) => {
    const ticketBookingModuleService = container.resolve(
      TICKET_BOOKING_MODULE
    ) as TicketBookingModuleService

    const venue = await ticketBookingModuleService.createVenues(input)

    return new StepResponse(venue, venue)
  },
  async (venue, { container }) => {
    if (!venue) return

    const ticketBookingModuleService = container.resolve(
      TICKET_BOOKING_MODULE
    ) as TicketBookingModuleService

    await ticketBookingModuleService.deleteVenues(venue.id)
  }
)
