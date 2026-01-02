import { model } from "@medusajs/framework/utils"

/**
 * Batch Reservation
 * 
 * Tracks quantity reservations from carts/checkouts.
 * Ensures scarcity is accurately reflected.
 */
const BatchReservation = model.define("batch_reservation", {
  id: model.id().primaryKey(),
  
  // Link to batch
  harvest_batch_id: model.text(),
  
  // Who reserved
  customer_id: model.text().nullable(),
  cart_id: model.text().nullable(),
  session_id: model.text().nullable(),
  
  // Quantity reserved
  quantity: model.number(),
  
  // Reservation expires
  expires_at: model.dateTime(),
  
  // Is this converted to an order?
  converted_to_order: model.boolean().default(false),
  order_id: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["harvest_batch_id"],
      name: "IDX_br_batch_id",
    },
    {
      on: ["cart_id"],
      name: "IDX_br_cart_id",
    },
    {
      on: ["expires_at"],
      name: "IDX_br_expires_at",
    },
  ])

export default BatchReservation
