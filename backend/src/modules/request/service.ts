import { MedusaService } from "@medusajs/framework/utils"
import { Request, RequestStatus } from "./models"
import { validateRequestPayload } from "./validators"

/**
 * Request Module Service
 *
 * Provides CRUD operations for requests/RFQs.
 * Supports mutual-aid marketplace interactions between customers and vendors.
 */
class RequestModuleService extends MedusaService({
  model: Request,
}) {
  /**
   * Create a new request from a customer to a provider
   * @param data - Request data including payload
   * @param options - Additional options
   * @param options.validatePayload - Whether to validate the payload (default: true)
   */
  async createRequest(
    data: {
      submitter_id: string
      provider_id?: string
      payload?: Record<string, unknown>
      notes?: string
    },
    options?: {
      validatePayload?: boolean
    }
  ) {
    const shouldValidate = options?.validatePayload !== false

    // Validate payload if enabled and payload has a type field
    let validatedPayload: Record<string, unknown> = data.payload || {}

    if (shouldValidate && data.payload && 'type' in data.payload) {
      try {
        validatedPayload = validateRequestPayload(data.payload) as Record<string, unknown>
        console.log("[RequestService] Payload validation passed:", validatedPayload.type)
      } catch (error: any) {
        console.error("[RequestService] Payload validation failed:", error)
        throw new Error(`Invalid request payload: ${error.message}`)
      }
    }

    return this.createRequests({
      submitter_id: data.submitter_id,
      provider_id: data.provider_id || null,
      payload: validatedPayload,
      notes: data.notes || null,
      status: RequestStatus.PENDING,
    })
  }

  /**
   * Get requests made by a specific submitter (customer)
   */
  async getSubmitterRequests(submitterId: string) {
    return this.listRequests({
      submitter_id: submitterId,
    })
  }

  /**
   * Get requests assigned to a specific provider (vendor)
   */
  async getProviderRequests(providerId: string) {
    return this.listRequests({
      provider_id: providerId,
    })
  }

  /**
   * Update request status
   */
  async updateRequestStatus(requestId: string, status: RequestStatus) {
    return this.updateRequests(
      { id: requestId },
      { status }
    )
  }

  /**
   * Accept a request (vendor action)
   */
  async acceptRequest(requestId: string) {
    return this.updateRequestStatus(requestId, RequestStatus.ACCEPTED)
  }

  /**
   * Reject a request (vendor action)
   */
  async rejectRequest(requestId: string) {
    return this.updateRequestStatus(requestId, RequestStatus.REJECTED)
  }

  /**
   * Complete a request
   */
  async completeRequest(requestId: string) {
    return this.updateRequestStatus(requestId, RequestStatus.COMPLETED)
  }

  /**
   * Cancel a request (submitter action)
   */
  async cancelRequest(requestId: string) {
    return this.updateRequestStatus(requestId, RequestStatus.CANCELLED)
  }
}

export default RequestModuleService

