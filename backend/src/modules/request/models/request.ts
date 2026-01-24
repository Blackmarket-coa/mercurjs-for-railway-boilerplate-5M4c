import { model } from "@medusajs/framework/utils"

/**
 * Request Status Enum
 * Tracks the lifecycle of a request/RFQ
 */
export enum RequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/**
 * Request Model
 *
 * Represents a request for quote (RFQ) or custom order request
 * between a submitter (customer) and a provider (vendor/seller).
 *
 * This is a custom implementation replacing @mercurjs/requests
 * for better stability and mutual-aid marketplace fit.
 */
const Request = model.define("request", {
  id: model.id().primaryKey(),
  type: model.text(),
  data: model.json().default({}),
  submitter_id: model.text(),
  reviewer_id: model.text().nullable(),
  reviewer_note: model.text().nullable(),
  status: model.enum(RequestStatus).default(RequestStatus.PENDING),
  requester_id: model.text().nullable(),
})
.indexes([
  {
    on: ["submitter_id"],
  },
  {
    on: ["status"],
  },
  {
    on: ["type"],
  },
])

export default Request
