import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { TICKET_BOOKING_MODULE } from "../modules/ticket-booking"
import TicketBookingModuleService from "../modules/ticket-booking/service"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  
  const query = container.resolve("query")
  const ticketBookingModuleService = container.resolve(
    TICKET_BOOKING_MODULE
  ) as TicketBookingModuleService

  // Get ticket purchases for this order
  const { data: ticketPurchases } = await query.graph({
    entity: "ticket_purchase",
    fields: ["id", "order_id"],
    filters: {
      order_id: orderId,
    },
  })

  if (!ticketPurchases || ticketPurchases.length === 0) {
    return
  }

  const ticketPurchaseIds = ticketPurchases.map((tp: any) => tp.id)
  
  // Generate QR codes for the tickets
  const qrCodes = await ticketBookingModuleService.generateTicketQRCodes(ticketPurchaseIds)

  // You can send these QR codes via email or store them
  console.log(`Generated ${Object.keys(qrCodes).length} QR codes for order ${orderId}`)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
