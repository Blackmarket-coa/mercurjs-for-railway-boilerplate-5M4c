import { MedusaService } from "@medusajs/framework/utils"
import Producer from "./models/producer"

class ProducerService extends MedusaService({
  Producer,
}) {}

export default ProducerService
