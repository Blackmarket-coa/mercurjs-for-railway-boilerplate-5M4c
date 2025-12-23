import { z } from "zod"
import { MediaType } from "../modules/digital-product/types"

// Define product schema inline since AdminCreateProduct is a Zod v3 factory
// that may not be compatible. Adjust fields to match your needs.
const productSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  is_giftcard: z.boolean().optional(),
  discountable: z.boolean().optional(),
  images: z.array(z.object({ url: z.string() })).optional(),
  thumbnail: z.string().optional(),
  handle: z.string().optional(),
  status: z.enum(["draft", "proposed", "published", "rejected"]).optional(),
  type_id: z.string().optional(),
  collection_id: z.string().optional(),
  categories: z.array(z.object({ id: z.string() })).optional(),
  tags: z.array(z.object({ id: z.string().optional(), value: z.string() })).optional(),
  options: z.array(z.object({
    title: z.string(),
    values: z.array(z.string()),
  })).optional(),
  variants: z.array(z.object({
    title: z.string(),
    sku: z.string().optional(),
    ean: z.string().optional(),
    upc: z.string().optional(),
    barcode: z.string().optional(),
    hs_code: z.string().optional(),
    mid_code: z.string().optional(),
    inventory_quantity: z.number().optional(),
    allow_backorder: z.boolean().optional(),
    manage_inventory: z.boolean().optional(),
    weight: z.number().optional(),
    length: z.number().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    origin_country: z.string().optional(),
    material: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
    prices: z.array(z.object({
      currency_code: z.string(),
      amount: z.number(),
    })).optional(),
    options: z.record(z.string()).optional(),
  })).optional(),
  sales_channels: z.array(z.object({ id: z.string() })).optional(),
  weight: z.number().optional(),
  length: z.number().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  hs_code: z.string().optional(),
  mid_code: z.string().optional(),
  origin_country: z.string().optional(),
  material: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
}).passthrough()  // Allow additional fields

export const createDigitalProductsSchema = z.object({
  name: z.string(),
  medias: z.array(z.object({
    type: z.nativeEnum(MediaType),
    file_id: z.string(),
    mime_type: z.string()
  })),
  product: productSchema
})

export type CreateDigitalProductsInput = z.infer<typeof createDigitalProductsSchema>
