import { defineLink } from "@medusajs/framework/utils"
import DemandPoolModule from "../modules/demand-pool"
import BargainingModule from "../modules/bargaining"

/**
 * Link Demand Post to Bargaining Group
 *
 * A demand post can have one or more bargaining groups formed around it.
 */
export default defineLink(
  DemandPoolModule.linkable.demandPost,
  {
    linkable: BargainingModule.linkable.bargainingGroup,
    isList: true,
  }
)
