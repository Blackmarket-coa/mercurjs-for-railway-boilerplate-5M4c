import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ProducerService from "../../../../../modules/producer/service"
import { PRODUCER_MODULE } from "../../../../../modules/producer"

type RouteParams = {
  id: string
}

export async function POST(
  req: MedusaRequest<{
    featured: boolean
  }, RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params
  const { featured } = req.body
  const producerModule = req.scope.resolve<ProducerService>(PRODUCER_MODULE)

  try {
    const updatedProducer = await producerModule.updateProducers({ id, featured })

    res.json({ producer: updatedProducer })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to update producer featured status",
    })
  }
}
