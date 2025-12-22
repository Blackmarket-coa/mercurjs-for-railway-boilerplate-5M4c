import { MedusaService } from "@medusajs/framework/utils"
import Venue from "./models/venue"
import VenueRow from "./models/venue-row"
import TicketProduct from "./models/ticket-product"
import TicketProductVariant from "./models/ticket-product-variant"
import TicketPurchase from "./models/ticket-purchase"

export class TicketBookingModuleService extends MedusaService({
  Venue,
  VenueRow,
  TicketProduct,
  TicketProductVariant,
  TicketPurchase,
}) { }

export default TicketBookingModuleService
