import { MedusaService } from "@medusajs/framework/utils"
import CmsType from "./models/cms-type"
import CmsCategory from "./models/cms-category"
import CmsTag from "./models/cms-tag"
import CmsAttribute from "./models/cms-attribute"
import CmsCategoryTag from "./models/cms-category-tag"
import CmsCategoryAttribute from "./models/cms-category-attribute"

class CmsBlueprintService extends MedusaService({
  CmsType,
  CmsCategory,
  CmsTag,
  CmsAttribute,
  CmsCategoryTag,
  CmsCategoryAttribute,
}) {}

export default CmsBlueprintService
