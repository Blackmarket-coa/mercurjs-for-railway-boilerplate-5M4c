import { defineLink } from "@medusajs/framework/utils"
import DemandPoolModule from "../modules/demand-pool"
import BuyerNetworkModule from "../modules/buyer-network"

/**
 * Link Demand Post to Buyer Network
 *
 * A demand post can originate from a buyer network.
 */
export default defineLink(
  BuyerNetworkModule.linkable.buyerNetwork,
  {
    linkable: DemandPoolModule.linkable.demandPost,
    isList: true,
  }
)
