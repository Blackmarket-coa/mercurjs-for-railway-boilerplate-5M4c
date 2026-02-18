import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { weightPriceRuleSchema } from "../../../../../shared/phase0-contracts"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payload = weightPriceRuleSchema.parse(req.body)

  if (payload.product_id !== req.params.id) {
    return res.status(400).json({
      message: "Contract mismatch: payload.product_id must match route :id",
      type: "invalid_data",
    })
  }

  return res.status(201).json({
    weight_price_rule: payload,
    message: "Weight pricing rule accepted under Phase 1 contract",
  })
}
