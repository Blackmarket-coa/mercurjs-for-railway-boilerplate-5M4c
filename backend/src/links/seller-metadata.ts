import { defineLink } from "@medusajs/framework/utils"
import SellerExtensionModule from "../modules/seller-extension"

/**
 * Link Seller to Seller Metadata
 * 
 * Links the MercurJS seller to our extension metadata.
 * This enables vendor_type and other extended fields.
 */

// Import MercurJS seller module
let SellerModule: any
try {
  SellerModule = require("@mercurjs/framework").SellerModule
} catch {
  try {
    SellerModule = require("@mercurjs/b2c-core/modules/seller").default
  } catch {
    console.warn("No seller module found - seller metadata links will not be created")
    SellerModule = null
  }
}

const sellerMetadataLink = SellerModule
  ? defineLink(
      {
        linkable: SellerModule.linkable.seller,
        isList: false,
      },
      {
        linkable: SellerExtensionModule.linkable.sellerMetadata,
        isList: false,
      }
    )
  : null

export default sellerMetadataLink
