import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ProducerService from "../../../../../modules/producer/service"
import { PRODUCER_MODULE } from "../../../../../modules/producer"

type RouteParams = {
  id: string
}

export async function POST(
  req: MedusaRequest<{
    verified: boolean
  }, RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params
  const { verified } = req.body
  const producerModule = req.scope.resolve<ProducerService>(PRODUCER_MODULE)

  try {
    const updateData: Record<string, unknown> = {
      id,
      verified: verified,
      verified_at: verified ? new Date() : null,
    }

    const updatedProducer = await producerModule.updateProducers(updateData)

    res.json({ producer: updatedProducer })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to update producer verification",
    })
  }
}
