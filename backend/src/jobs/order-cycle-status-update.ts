import { MedusaContainer } from "@medusajs/framework/types"
import { ORDER_CYCLE_MODULE } from "../../modules/order-cycle"

/**
 * Scheduled Job: Update Order Cycle Statuses
 * 
 * Runs every 5 minutes to automatically transition order cycles:
 * - upcoming/draft → open (when opens_at is reached)
 * - open → closed (when closes_at is reached)
 * 
 * Register this in medusa-config.ts:
 * 
 * jobs: [
 *   {
 *     resolve: "./src/jobs/order-cycle-status-update",
 *     options: {
 *       schedule: "*/5 * * * *", // Every 5 minutes
 *     },
 *   },
 * ],
 */

export default async function orderCycleStatusUpdateJob(
  container: MedusaContainer
) {
  const orderCycleService = container.resolve(ORDER_CYCLE_MODULE)
  
  console.log("[Order Cycle Job] Checking for status updates...")
  
  try {
    const results = await orderCycleService.updateOrderCycleStatuses()
    
    if (results.opened > 0 || results.closed > 0) {
      console.log(
        `[Order Cycle Job] Updated ${results.opened} cycles to open, ${results.closed} cycles to closed`
      )
    }
    
    return results
  } catch (error) {
    console.error("[Order Cycle Job] Error updating statuses:", error)
    throw error
  }
}

export const config = {
  name: "order-cycle-status-update",
  schedule: "*/5 * * * *", // Every 5 minutes
}
