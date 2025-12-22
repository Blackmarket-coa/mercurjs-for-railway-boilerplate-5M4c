// src/workflows/fulfill-digital-order/index.ts
import { createWorkflow } from "@medusajs/workflows-sdk"
import { fulfillDigitalOrderStep } from "./steps/fulfill-digital-order-step"

export const fulfillDigitalOrderWorkflow = createWorkflow({
  id: "bmc-fulfill-digital-order",
  steps: [fulfillDigitalOrderStep],
})
