import { MedusaService } from "@medusajs/framework/utils"
import { Producer } from "./models"

class ProducerService extends MedusaService({
  Producer,
}) {}

export default ProducerService
