import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function isDeliveryRestaurant(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // TODO: Implement restaurant validation logic
  // For now, just pass through
  next()
}
