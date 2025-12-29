import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { HAWALA_LEDGER_MODULE } from "../modules/hawala-ledger"
import HawalaLedgerModuleService from "../modules/hawala-ledger/service"

/**
 * Subscriber that processes order payments through the Hawala ledger
 * when an order is completed/paid
 */
export default async function hawalaOrderPaymentSubscriber({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const hawalaService = container.resolve<HawalaLedgerModuleService>(HAWALA_LEDGER_MODULE)
  const orderModuleService = container.resolve("order")

  const orderId = event.data.id
  console.log(`[Hawala] Processing payment for order: ${orderId}`)

  try {
    // Get order details
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items", "customer"],
    })

    if (!order) {
      console.log(`[Hawala] Order not found: ${orderId}`)
      return
    }

    // Get or create customer wallet
    const customerId = order.customer_id
    if (!customerId) {
      console.log(`[Hawala] No customer ID for order: ${orderId}`)
      return
    }

    let customerWallets = await hawalaService.listLedgerAccounts({
      account_type: "USER_WALLET",
      owner_type: "CUSTOMER",
      owner_id: customerId,
    })

    if (customerWallets.length === 0) {
      // Create wallet for customer
      const wallet = await hawalaService.createAccount({
        account_type: "USER_WALLET",
        owner_type: "CUSTOMER",
        owner_id: customerId,
      })
      customerWallets = [wallet]
    }

    // Get seller ID (from marketplace context or default)
    const sellerId = (order as any).seller_id || "default-seller"

    // Get or create seller earnings account
    let sellerAccounts = await hawalaService.listLedgerAccounts({
      account_type: "SELLER_EARNINGS",
      owner_type: "SELLER",
      owner_id: sellerId,
    })

    if (sellerAccounts.length === 0) {
      const account = await hawalaService.createAccount({
        account_type: "SELLER_EARNINGS",
        owner_type: "SELLER",
        owner_id: sellerId,
      })
      sellerAccounts = [account]
    }

    // Calculate amounts
    const totalAmount = Number(order.total) / 100 // Convert from cents
    const platformFeePercentage = 0.05 // 5% platform fee
    const platformFeeAmount = totalAmount * platformFeePercentage

    // Check for auto-invest settings
    const producerId = (order as any).producer_id || null
    const autoInvestPercentage = (order as any).auto_invest_percentage || 0

    // Process order payment through ledger
    const entries = await hawalaService.processOrderPayment({
      customer_account_id: customerWallets[0].id,
      seller_account_id: sellerAccounts[0].id,
      order_id: orderId,
      total_amount: totalAmount,
      platform_fee_amount: platformFeeAmount,
      producer_id: producerId,
      auto_invest_percentage: autoInvestPercentage,
      idempotency_key: `order-payment-${orderId}`,
    })

    console.log(`[Hawala] Order ${orderId} processed: ${entries.length} ledger entries created`)
  } catch (error) {
    console.error(`[Hawala] Error processing order ${orderId}:`, error)
    // Don't throw - order completion should not fail due to ledger issues
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
