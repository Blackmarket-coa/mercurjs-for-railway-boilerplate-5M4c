import { MedusaService } from "@medusajs/framework/utils"
import { Request, RequestStatus } from "./models"

/**
 * Request Module Service
 *
 * Provides CRUD operations for requests/RFQs.
 * Supports mutual-aid marketplace interactions between customers and vendors.
 */
class RequestModuleService extends MedusaService({
  Request,
}) {
  /**
   * Create a new request from a customer to a provider
   */
  async createRequest(data: {
    requester_id: string
    provider_id?: string
    payload?: Record<string, unknown>
    notes?: string
  }) {
    return this.createRequests({
      requester_id: data.requester_id,
      provider_id: data.provider_id || null,
      payload: data.payload || {},
      notes: data.notes || null,
      status: RequestStatus.PENDING,
    })
  }

  /**
   * Get requests made by a specific requester (customer)
   */
  async getRequesterRequests(requesterId: string) {
    return this.listRequests({
      requester_id: requesterId,
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
   * Cancel a request (requester action)
   */
  async cancelRequest(requestId: string) {
    return this.updateRequestStatus(requestId, RequestStatus.CANCELLED)
  }
}

export default RequestModuleService
