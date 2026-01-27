import { MedusaService } from "@medusajs/framework/utils"
import { Harvest, Lot, AvailabilityWindow } from "./models"

class AgricultureService extends MedusaService({
  Harvest,
  Lot,
  AvailabilityWindow,
}) {}

export default AgricultureService
