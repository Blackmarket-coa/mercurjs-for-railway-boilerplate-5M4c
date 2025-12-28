import { MedusaService } from "@medusajs/framework/utils"
import SellerMetadata from "./models/seller-metadata"

class SellerExtensionService extends MedusaService({
  SellerMetadata,
}) {}

export default SellerExtensionService
