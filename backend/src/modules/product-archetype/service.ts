import { MedusaService } from "@medusajs/framework/utils"
import { ProductArchetype, ProductArchetypeAssignment } from "./models"

class ProductArchetypeService extends MedusaService({
  ProductArchetype,
  ProductArchetypeAssignment,
}) {}

export default ProductArchetypeService
