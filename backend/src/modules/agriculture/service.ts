import { MedusaService } from "@medusajs/framework/utils"
import Harvest from "./models/harvest"
import Lot from "./models/lot"
import AvailabilityWindow from "./models/availability-window"

class AgricultureService extends MedusaService({
  Harvest,
  Lot,
  AvailabilityWindow,
}) {}

export default AgricultureService
