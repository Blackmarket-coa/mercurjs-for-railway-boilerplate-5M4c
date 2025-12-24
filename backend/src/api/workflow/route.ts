import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createSalesChannelWorkflow } from "../../workflows/create-sales-channel"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { result } = await createSalesChannelWorkflow(req.scope)
    .run()

  res.send(result)
}
