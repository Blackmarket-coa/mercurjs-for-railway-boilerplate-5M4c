import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import ProducerService from "../../../../../../../modules/producer/service"
import { PRODUCER_MODULE } from "../../../../../../../modules/producer"

type RouteParams = {
  id: string
  index: string
}

interface Certification {
  name: string
  issuer: string
  valid_until?: string
  document_url?: string
  verified?: boolean
}

export async function POST(
  req: MedusaRequest<{
    verified: boolean
  }, RouteParams>,
  res: MedusaResponse
) {
  const { id, index } = req.params
  const { verified } = req.body
  const certIndex = parseInt(index, 10)
  
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const producerModule = req.scope.resolve<ProducerService>(PRODUCER_MODULE)

  try {
    // Get current producer
    const { data: producers } = await query.graph({
      entity: "producer",
      fields: ["id", "certifications"],
      filters: { id },
    })

    const producer = producers?.[0]
    
    if (!producer) {
      res.status(404).json({
        message: `Producer with ID ${id} not found`,
      })
      return
    }

    const certifications = (producer.certifications as Certification[]) || []
    
    if (certIndex < 0 || certIndex >= certifications.length) {
      res.status(400).json({
        message: `Invalid certification index ${certIndex}`,
      })
      return
    }

    // Update the certification's verified status
    certifications[certIndex] = {
      ...certifications[certIndex],
      verified,
    }

    const updatedProducer = await producerModule.updateProducers({
      id,
      certifications: certifications as unknown as Record<string, unknown>,
    })

    res.json({ producer: updatedProducer })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to verify certification",
    })
  }
}
