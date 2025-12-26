import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TICKET_BOOKING_MODULE } from "../../modules/ticket-booking"
import TicketBookingModuleService from "../../modules/ticket-booking/service"
import { RowType } from "../../modules/ticket-booking/models/venue-row"

export type CreateVenueRowsStepInput = {
  rows: {
    venue_id: string
    row_number: string
    row_type: RowType
    seat_count: number
  }[]
}

export const createVenueRowsStep = createStep(
  "create-venue-rows",
  async (input: CreateVenueRowsStepInput, { container }) => {
    const ticketBookingModuleService = container.resolve(
      TICKET_BOOKING_MODULE
    ) as TicketBookingModuleService

    const venueRows = await ticketBookingModuleService.createVenueRows(input.rows)

    return new StepResponse(venueRows, venueRows)
  },
  async (venueRows, { container }) => {
    if (!venueRows) return

    const ticketBookingModuleService = container.resolve(
      TICKET_BOOKING_MODULE
    ) as TicketBookingModuleService

    await ticketBookingModuleService.deleteVenueRows(venueRows.map((row: any) => row.id))
  }
)
