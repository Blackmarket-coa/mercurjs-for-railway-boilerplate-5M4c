import { MedusaContainer } from "@medusajs/framework/types"
import { SUBSCRIPTION_MODULE } from "../modules/subscription"
import SubscriptionModuleService from "../modules/subscription/service"
import { SubscriptionStatus } from "../modules/subscription/types"

/**
 * Subscription Renewal Job
 * 
 * This scheduled job runs periodically to:
 * 1. Find subscriptions due for renewal
 * 2. Process renewals (create orders, capture payments)
 * 3. Update subscription dates
 * 4. Expire subscriptions past their end date
 * 
 * Schedule: Run every hour to catch due subscriptions
 * 
 * In production, you would also:
 * - Send renewal reminder emails
 * - Handle payment failures gracefully
 * - Implement retry logic for failed payments
 */
export default async function processSubscriptionRenewals(
  container: MedusaContainer
) {
  const subscriptionService = container.resolve<SubscriptionModuleService>(
    SUBSCRIPTION_MODULE
  )

  console.log("[Subscription Job] Starting subscription renewal check...")

  try {
    // 1. Get subscriptions due for renewal
    const dueSubscriptions = await subscriptionService.getDueSubscriptions()
    
    console.log(`[Subscription Job] Found ${dueSubscriptions.length} subscriptions due for renewal`)

    // 2. Process each due subscription
    for (const subscription of dueSubscriptions) {
      try {
        // Skip if already processed or not active
        if (subscription.status !== SubscriptionStatus.ACTIVE) {
          continue
        }

        // Check if past expiration
        if (subscription.expiration_date && new Date() > new Date(subscription.expiration_date)) {
          console.log(`[Subscription Job] Expiring subscription ${subscription.id}`)
          await subscriptionService.expireSubscription(subscription.id)
          continue
        }

        // In production, you would:
        // 1. Call renewSubscriptionWorkflow
        // 2. Create order from cart template
        // 3. Capture payment from saved method
        // 4. Send confirmation email

        console.log(`[Subscription Job] Processing renewal for subscription ${subscription.id}`)
        
        // For now, just update the subscription dates
        await subscriptionService.recordNewSubscriptionOrder(subscription.id)
        
        console.log(`[Subscription Job] Successfully processed subscription ${subscription.id}`)
      } catch (error) {
        console.error(`[Subscription Job] Failed to process subscription ${subscription.id}:`, error)
        
        // Mark as failed
        await subscriptionService.failSubscription(
          subscription.id,
          error instanceof Error ? error.message : "Unknown error"
        )
      }
    }

    // 3. Expire old subscriptions
    const allSubscriptions = await subscriptionService.listSubscriptions({
      status: SubscriptionStatus.ACTIVE
    })

    const now = new Date()
    const expiredIds = allSubscriptions
      .filter(s => s.expiration_date && new Date(s.expiration_date) < now)
      .map(s => s.id)

    if (expiredIds.length > 0) {
      console.log(`[Subscription Job] Expiring ${expiredIds.length} past-due subscriptions`)
      await subscriptionService.expireSubscription(expiredIds)
    }

    console.log("[Subscription Job] Completed subscription renewal check")
  } catch (error) {
    console.error("[Subscription Job] Error in subscription renewal job:", error)
  }
}

export const config = {
  name: "process-subscription-renewals",
  // Run every hour
  schedule: "0 * * * *",
}
