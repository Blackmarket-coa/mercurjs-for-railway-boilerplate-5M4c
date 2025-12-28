import { defineLink } from "@medusajs/framework/utils"
import ProducerModule from "../modules/producer"

/**
 * Link Producer to MercurJS Seller
 * 
 * Links the producer (farm profile) to a MercurJS seller.
 */

let SellerModule: any
try {
  SellerModule = require("@mercurjs/framework").SellerModule
} catch {
  try {
    SellerModule = require("@mercurjs/b2c-core/modules/seller").default
  } catch {
    console.warn("No seller module found - producer links will not be created")
    SellerModule = null
  }
}

const producerSellerLink = SellerModule
  ? defineLink(
      {
        linkable: SellerModule.linkable.seller,
        isList: false,
      },
      {
        linkable: ProducerModule.linkable.producer,
        isList: false,
      }
    )
  : null

export default producerSellerLink
