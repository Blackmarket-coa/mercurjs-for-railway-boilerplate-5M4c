import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import createDigitalProductWorkflow from "../../../workflows/create-digital-product"
import { CreateDigitalProductMediaInput } from "../../../workflows/create-digital-product/steps/create-digital-product-medias"
import { createDigitalProductsSchema } from "../../validation-schemas"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { 
    fields, 
    limit = 20, 
    offset = 0 
  } = req.validatedQuery || {}

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { 
    data: digitalProducts,
    metadata: { count, take, skip } = {} 
  } = await query.graph({
    entity: "digital_product",
    fields: [
      "*",
      "medias.*",
      "product_variant.*",
      ...(fields || []),
    ],
    pagination: {
      skip: offset,
      take: limit,
    },
  })

  res.json({
    digital_products: digitalProducts,
    count,
    limit: take,
    offset: skip,
  })
}

// Extract TypeScript type from Zod schema
type CreateRequestBody = z.infer<typeof createDigitalProductsSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateRequestBody>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Get default shipping profile
  const { data: [shippingProfile] } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })

  const { name, medias, product } = req.validatedBody

  // Map medias for workflow input
  const mediaInputs: Omit<CreateDigitalProductMediaInput, "digital_product_id">[] = medias.map(m => ({
    fileId: m.file_id,
    mimeType: m.mime_type,
    type: m.type,
  }))

  // Run the workflow
  const { result } = await createDigitalProductWorkflow(req.scope).run({
    input: {
      digital_product: {
        name,
        medias: mediaInputs,
      },
      product: {
        ...product,
        shipping_profile_id: shippingProfile.id,
      },
    },
  })

  res.json({
    digital_product: result.digital_product,
  })
}
