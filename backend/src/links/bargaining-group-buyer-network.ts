import { defineLink } from "@medusajs/framework/utils"
import BargainingModule from "../modules/bargaining"
import BuyerNetworkModule from "../modules/buyer-network"

/**
 * Link Bargaining Group to Buyer Network
 *
 * A bargaining group can be associated with a buyer network.
 */
export default defineLink(
  BuyerNetworkModule.linkable.buyerNetwork,
  {
    linkable: BargainingModule.linkable.bargainingGroup,
    isList: true,
  }
)
