import { z } from "zod"

/**
 * Request Type Identifiers
 */
export const REQUEST_TYPES = {
  SELLER_CREATION: "seller_creation",
  CUSTOM_ORDER: "custom_order",
  QUOTE_REQUEST: "quote_request",
} as const

/**
 * Vendor types available for sellers
 */
const vendorTypeEnum = z.enum([
  "producer",
  "garden",
  "maker",
  "restaurant",
  "mutual_aid",
])

/**
 * Seller Creation Request Payload Schema
 * Validates the payload for seller registration requests
 */
export const sellerCreationPayloadSchema = z.object({
  type: z.literal(REQUEST_TYPES.SELLER_CREATION),
  auth_identity_id: z.string().min(1, "Auth identity ID is required"),
  member: z.object({
    name: z.string().min(1, "Member name is required"),
    email: z.string().email("Valid email is required"),
  }),
  seller: z.object({
    name: z.string().min(1, "Seller name is required"),
  }),
  vendor_type: vendorTypeEnum.default("producer"),
})

/**
 * Custom Order Request Payload Schema (for future use)
 */
export const customOrderPayloadSchema = z.object({
  type: z.literal(REQUEST_TYPES.CUSTOM_ORDER),
  products: z.array(z.object({
    product_id: z.string().optional(),
    name: z.string(),
    quantity: z.number().positive(),
    notes: z.string().optional(),
  })),
  delivery_date: z.string().optional(),
  delivery_address: z.object({
    address_1: z.string(),
    city: z.string(),
    postal_code: z.string(),
    country_code: z.string(),
  }).optional(),
})

/**
 * Quote Request Payload Schema (for future use)
 */
export const quoteRequestPayloadSchema = z.object({
  type: z.literal(REQUEST_TYPES.QUOTE_REQUEST),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  deadline: z.string().optional(),
})

/**
 * Union of all request payload schemas
 */
export const requestPayloadSchema = z.discriminatedUnion("type", [
  sellerCreationPayloadSchema,
  customOrderPayloadSchema,
  quoteRequestPayloadSchema,
])

/**
 * Type exports
 */
export type SellerCreationPayload = z.infer<typeof sellerCreationPayloadSchema>
export type CustomOrderPayload = z.infer<typeof customOrderPayloadSchema>
export type QuoteRequestPayload = z.infer<typeof quoteRequestPayloadSchema>
export type RequestPayload = z.infer<typeof requestPayloadSchema>

/**
 * Validate request payload based on type
 * @param payload - The payload to validate
 * @returns Validated payload
 * @throws ZodError if validation fails
 */
export function validateRequestPayload(payload: unknown): RequestPayload {
  return requestPayloadSchema.parse(payload)
}

/**
 * Safe validation that returns success/error result
 */
export function safeValidateRequestPayload(payload: unknown) {
  return requestPayloadSchema.safeParse(payload)
}
