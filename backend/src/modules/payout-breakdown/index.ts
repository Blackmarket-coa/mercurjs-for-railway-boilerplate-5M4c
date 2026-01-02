import { Module } from "@medusajs/framework/utils"
import PayoutBreakdownService from "./service"

export const PAYOUT_BREAKDOWN_MODULE = "payoutBreakdown"

export default Module(PAYOUT_BREAKDOWN_MODULE, {
  service: PayoutBreakdownService,
})
