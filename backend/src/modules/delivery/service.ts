import { MedusaService } from "@medusajs/framework/utils"
import { Delivery, Driver } from "./models"

class DeliveryModuleService extends MedusaService({
  Delivery,
  Driver,
}) {}

export default DeliveryModuleService;
