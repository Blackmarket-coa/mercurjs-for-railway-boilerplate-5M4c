/**
 * Script to link a product to a seller
 * 
 * Usage: npx medusa exec src/scripts/link-product-seller.ts
 */

import { ExecArgs } from "@medusajs/framework/types"

export default async function linkProductSeller({ container }: ExecArgs) {
  const linkService = container.resolve("remoteLink")
  
  const productId = "prod_01KDZW4Z82TXHHCHFMY0MBRDRR"
  const sellerId = "mem_01KBN8XGXAA69D6R1ZZ7ZW8N8W"
  
  console.log(`Linking product ${productId} to seller ${sellerId}...`)
  
  try {
    await linkService.create({
      productService: { product_id: productId },
      sellerModuleService: { seller_id: sellerId }
    })
    console.log("✅ Product linked to seller successfully!")
  } catch (error) {
    console.error("Error linking product:", error)
    
    // Try alternative link format
    try {
      console.log("Trying alternative link format...")
      await linkService.create([
        {
          "product": { "product_id": productId },
          "seller": { "seller_id": sellerId }
        }
      ])
      console.log("✅ Product linked to seller successfully (alt format)!")
    } catch (altError) {
      console.error("Alternative format also failed:", altError)
    }
  }
}
