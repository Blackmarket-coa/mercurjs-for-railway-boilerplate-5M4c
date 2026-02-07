import { MedusaService } from "@medusajs/framework/utils"
import { WooCommerceConnection, WooCommerceImportLog } from "./models"

class WooCommerceImportModuleService extends MedusaService({
  WooCommerceConnection,
  WooCommerceImportLog,
}) {}

export default WooCommerceImportModuleService
