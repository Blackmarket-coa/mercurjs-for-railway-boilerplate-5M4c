import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

// Core product fields - avoiding relations that may not exist
const productFields = [
  "id",
  "title",
  "subtitle",
  "status",
  "external_id",
  "description",
  "handle",
  "is_giftcard",
  "discountable",
  "thumbnail",
  "collection_id",
  "type_id",
  "weight",
  "length",
  "height",
  "width",
  "hs_code",
  "origin_country",
  "mid_code",
  "material",
  "metadata",
  "images.*",
  "variants.*",
  "variants.prices.*",
  "variants.inventory_items.*",
]

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerId = (req as any).auth_context?.actor_id
  const { id } = req.params

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" })
  }

  try {
    // Fetch the full product with all fields including images
    const { data: products } = await query.graph({
      entity: "product",
      fields: productFields,
      filters: {
        id: id
      }
    })

    if (products && products.length > 0) {
      return res.json({
        product: products[0]
      })
    }

    return res.status(404).json({ message: "Product not found" })
  } catch (error: any) {
    console.error(`Error fetching product ${id} for seller ${sellerId}:`, error)
    res.status(500).json({ 
      message: "Failed to fetch product", 
      error: error.message 
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerId = (req as any).auth_context?.actor_id
  const { id } = req.params

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" })
  }

  try {
    const { additional_data, ...update } = req.body as any

    // Run the update workflow
    const { result } = await updateProductsWorkflow(req.scope).run({
      input: {
        update,
        selector: { id },
        additional_data,
      },
    })

    // Fetch updated product with all fields
    const { data: products } = await query.graph({
      entity: "product",
      fields: productFields,
      filters: {
        id: result[0]?.id || id
      }
    })

    if (products && products.length > 0) {
      return res.json({
        product: products[0]
      })
    }

    return res.status(404).json({ message: "Product not found after update" })
  } catch (error: any) {
    console.error(`Error updating product ${id} for seller ${sellerId}:`, error)
    res.status(500).json({ 
      message: "Failed to update product", 
      error: error.message 
    })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const sellerId = (req as any).auth_context?.actor_id
  const { id } = req.params

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" })
  }

  try {
    const { deleteProductsWorkflow } = await import("@medusajs/medusa/core-flows")
    
    await deleteProductsWorkflow(req.scope).run({
      input: {
        ids: [id]
      },
    })

    return res.json({
      id,
      object: "product",
      deleted: true
    })
  } catch (error: any) {
    console.error(`Error deleting product ${id} for seller ${sellerId}:`, error)
    res.status(500).json({ 
      message: "Failed to delete product", 
      error: error.message 
    })
  }
}
