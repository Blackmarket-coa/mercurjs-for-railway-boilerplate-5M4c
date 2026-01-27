import { MedusaService } from "@medusajs/framework/utils"
import { Cooperative, CooperativeMember, CooperativeListing } from "./models"

class CooperativeService extends MedusaService({
  Cooperative,
  CooperativeMember,
  CooperativeListing,
}) {}

export default CooperativeService
