import { MedusaService } from "@medusajs/framework/utils"
import { DigitalProduct, DigitalProductMedia, DigitalProductOrder } from "./models"

class DigitalProductModuleService extends MedusaService({
  DigitalProduct,
  DigitalProductMedia,
  DigitalProductOrder,
}) {}

export default DigitalProductModuleService