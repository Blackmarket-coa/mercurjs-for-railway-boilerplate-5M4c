import { MedusaService } from "@medusajs/framework/utils"
import Cooperative from "./models/cooperative"
import CooperativeMember from "./models/cooperative-member"
import CooperativeListing from "./models/cooperative-listing"

class CooperativeService extends MedusaService({
  Cooperative,
  CooperativeMember,
  CooperativeListing,
}) {}

export default CooperativeService
