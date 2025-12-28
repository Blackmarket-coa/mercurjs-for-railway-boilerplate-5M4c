import { MedusaService } from "@medusajs/framework/utils"
import ProductArchetype from "./models/product-archetype"
import ProductArchetypeAssignment from "./models/product-archetype-assignment"

class ProductArchetypeService extends MedusaService({
  ProductArchetype,
  ProductArchetypeAssignment,
}) {}

export default ProductArchetypeService
