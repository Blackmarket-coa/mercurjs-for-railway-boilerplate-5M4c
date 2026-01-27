import { Module } from "@medusajs/framework/utils"
import TicketBookingModuleService from "./service"

export const TICKET_BOOKING_MODULE = "ticketBooking"

export default Module(TICKET_BOOKING_MODULE, {
  service: TicketBookingModuleService,
})

// Re-export types for external use
export * from "./models"