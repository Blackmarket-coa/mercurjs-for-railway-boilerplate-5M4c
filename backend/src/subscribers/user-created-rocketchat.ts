import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { getRocketChatService } from "../shared/rocketchat-service"
import crypto from "crypto"

/**
 * Subscriber: User Created - RocketChat Integration
 *
 * Automatically creates RocketChat accounts for admin users when they are created.
 * This ensures admins can access the messaging system immediately.
 */
export default async function userCreatedRocketChatHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const userId = event.data.id

  if (!userId) {
    console.warn("[userCreated RocketChat] Event received without user ID")
    return
  }

  console.log(`[userCreated RocketChat] Processing user ${userId}`)

  try {
    const rocketchatService = getRocketChatService()

    // Skip if RocketChat is not configured
    if (!rocketchatService) {
      console.log("[userCreated RocketChat] RocketChat not configured, skipping")
      return
    }

    // Get user information
    const userModule = container.resolve(Modules.USER)
    const user = await userModule.retrieveUser(userId)

    if (!user || !user.email) {
      console.warn(`[userCreated RocketChat] User ${userId} not found or has no email`)
      return
    }

    // Create RocketChat account
    const username = user.email.split("@")[0]
    const rocketchatPassword = crypto.randomBytes(32).toString("hex")

    const { userId: rocketchatUserId, username: rocketchatUsername } = await rocketchatService.createUser(
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.email,
      user.email,
      username,
      rocketchatPassword
    )

    // Add admin to general channel
    await rocketchatService.addUserToChannel("general", rocketchatUsername)

    console.log(`[userCreated RocketChat] Created RocketChat account for admin user: ${rocketchatUsername}`)
  } catch (error: any) {
    console.error(`[userCreated RocketChat] Failed to create RocketChat account for user ${userId}:`, error.message)
    // Don't throw - this is a non-critical enhancement
  }
}

export const config: SubscriberConfig = {
  event: "user.created",
}
