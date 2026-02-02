import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getRocketChatService } from "../shared/rocketchat-service"
import crypto from "crypto"

/**
 * Subscriber: Customer Created - RocketChat Integration
 *
 * Automatically creates RocketChat accounts for customers when they register.
 * This ensures customers can access the messaging system immediately after signup.
 */
export default async function customerCreatedRocketChatHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerId = event.data.id

  if (!customerId) {
    console.warn("[customerCreated RocketChat] Event received without customer ID")
    return
  }

  console.log(`[customerCreated RocketChat] Processing customer ${customerId}`)

  try {
    const rocketchatService = getRocketChatService()

    // Skip if RocketChat is not configured
    if (!rocketchatService) {
      console.log("[customerCreated RocketChat] RocketChat not configured, skipping")
      return
    }

    // Get customer information using query graph
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: [customer] } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: {
        id: customerId,
      },
    })

    if (!customer || !customer.email) {
      console.warn(`[customerCreated RocketChat] Customer ${customerId} not found or has no email`)
      return
    }

    // Create RocketChat account
    const username = customer.email.split("@")[0]
    const rocketchatPassword = crypto.randomBytes(32).toString("hex")

    const { userId: rocketchatUserId, username: rocketchatUsername } = await rocketchatService.createUser(
      customer.first_name && customer.last_name
        ? `${customer.first_name} ${customer.last_name}`
        : customer.email,
      customer.email,
      username,
      rocketchatPassword
    )

    // Add customer to general channel
    await rocketchatService.addUserToChannel("general", rocketchatUsername)

    console.log(`[customerCreated RocketChat] Created RocketChat account for customer: ${rocketchatUsername}`)
  } catch (error: any) {
    console.error(`[customerCreated RocketChat] Failed to create RocketChat account for customer ${customerId}:`, error.message)
    // Don't throw - this is a non-critical enhancement
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
