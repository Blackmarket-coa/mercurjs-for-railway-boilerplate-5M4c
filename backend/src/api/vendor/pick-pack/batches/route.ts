import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { pickPackBatchSchema } from "../../../../shared/phase0-contracts"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payload = pickPackBatchSchema.parse(req.body)

  res.status(201).json({
    batch: payload,
    message: "Pick/pack batch accepted under Phase 1 contract",
  })
}
