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
 * between a requester (customer) and a provider (vendor/seller).
 *
 * This is a custom implementation replacing @mercurjs/requests
 * for better stability and mutual-aid marketplace fit.
 */
const Request = model.define("request", {
  id: model.id().primaryKey(),
  requester_id: model.text(),
  provider_id: model.text().nullable(),
  status: model.enum(RequestStatus).default(RequestStatus.PENDING),
  payload: model.json().default({}),
  notes: model.text().nullable(),
  created_at: model.dateTime().default(() => new Date()),
  updated_at: model.dateTime().default(() => new Date()),
})
.indexes([
  {
    on: ["requester_id"],
  },
  {
    on: ["provider_id"],
  },
  {
    on: ["status"],
  },
])

export default Request
