import { HttpTypes } from "@medusajs/types"

export type Cart = HttpTypes.StoreCart

export interface StoreCartLineItemOptimisticUpdate
  extends Partial<HttpTypes.StoreCartLineItem> {
  tax_total: number
}
