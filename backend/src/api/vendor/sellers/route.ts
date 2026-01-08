import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createSellerWorkflow } from "@mercurjs/b2c-core/workflows"
import { createSellerSchema, CreateSellerInput } from "./validators"

// Disable automatic authentication to allow public registration
export const AUTHENTICATE = false

/**
 * POST /vendor/sellers
 *
 * Create a new seller during vendor registration.
 * This endpoint is called after the auth registration to create the seller entity.
 * Seller metadata (including vendor_type) is created by the seller-created subscriber.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Manually validate request body using Zod schema
  let body: CreateSellerInput
  try {
    body = createSellerSchema.parse(req.body)
  } catch (validationError: any) {
    console.error("[POST /vendor/sellers] Validation error:", validationError)
    return res.status(400).json({
      type: "invalid_data",
      message: validationError.errors?.[0]?.message || "Invalid request data",
      errors: validationError.errors,
    })
  }

  console.log("[POST /vendor/sellers] Creating seller:", body.name)

  try {
    // Create the seller using MercurJS workflow
    // The seller-created subscriber will automatically create metadata with default vendor_type
    const { result: seller } = await createSellerWorkflow.run({
      container: req.scope,
      input: {
        member: {
          name: body.member.name,
          email: body.member.email,
        },
        seller: {
          name: body.name,
        },
      },
    })

    return res.status(201).json({
      seller: {
        id: seller.id,
        name: seller.name,
        members: seller.members,
      },
    })
  } catch (error: any) {
    console.error("Failed to create seller:", error)

    // Return proper error response
    return res.status(400).json({
      type: "invalid_data",
      message: error.message || "Failed to create seller",
    })
  }
}
