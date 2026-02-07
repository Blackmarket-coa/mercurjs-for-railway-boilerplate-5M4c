import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { SELLER_MODULE } from "@mercurjs/b2c-core/modules/seller"
import { getRocketChatService } from "../shared/rocketchat-service"
import crypto from "crypto"

type SellerModuleLike = {
  retrieveSeller: (
    sellerId: string,
    options?: { relations?: string[] }
  ) => Promise<{
    handle?: string | null
    name?: string | null
    members?: Array<{ email?: string | null }>
  } | null>
}

/**
 * Subscriber: Seller Created - RocketChat Integration
 *
 * Automatically creates RocketChat accounts for sellers/vendors when they are created.
 * This ensures vendors can access the messaging system immediately after approval.
 */
export default async function sellerCreatedRocketChatHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const sellerId = event.data.id

  if (!sellerId) {
    console.warn("[sellerCreated RocketChat] Event received without seller ID")
    return
  }

  console.log(`[sellerCreated RocketChat] Processing seller ${sellerId}`)

  try {
    const rocketchatService = getRocketChatService()

    // Skip if RocketChat is not configured
    if (!rocketchatService) {
      console.log("[sellerCreated RocketChat] RocketChat not configured, skipping")
      return
    }

    // Get seller information from MercurJS
    const sellerService = container.resolve(SELLER_MODULE) as SellerModuleLike
    const seller = await sellerService.retrieveSeller(sellerId, {
      relations: ["members"],
    })

    if (!seller || !seller.members || seller.members.length === 0) {
      console.warn(`[sellerCreated RocketChat] Seller ${sellerId} not found or has no members`)
      return
    }

    // Get the primary member (first member)
    const member = seller.members[0]

    if (!member.email) {
      console.warn(`[sellerCreated RocketChat] Seller member has no email`)
      return
    }

    // Create RocketChat account
    const username = seller.handle || member.email.split("@")[0]
    const rocketchatPassword = crypto.randomBytes(32).toString("hex")

    const { userId: rocketchatUserId, username: rocketchatUsername } = await rocketchatService.createUser(
      seller.name || member.email,
      member.email,
      username,
      rocketchatPassword
    )

    // Create vendor-specific channel
    const channelName = `vendor-${seller.handle || sellerId}`
    await rocketchatService.createSellerChannel(channelName, `${seller.name || "Vendor"} Channel`)

    // Add vendor to their channel and general channel
    await rocketchatService.addUserToChannel(channelName, rocketchatUsername)
    await rocketchatService.addUserToChannel("general", rocketchatUsername)

    console.log(`[sellerCreated RocketChat] Created RocketChat account and channel for vendor: ${rocketchatUsername}`)
  } catch (error: any) {
    console.error(`[sellerCreated RocketChat] Failed to create RocketChat account for seller ${sellerId}:`, error.message)
    // Don't throw - this is a non-critical enhancement
  }
}

export const config: SubscriberConfig = {
  event: "sellerCreated",
}
