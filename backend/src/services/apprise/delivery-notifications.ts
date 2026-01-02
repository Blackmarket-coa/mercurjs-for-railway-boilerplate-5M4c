/**
 * Delivery Notification Templates
 * 
 * Pre-built notification templates for delivery-related events.
 */

import { AppriseService, AppriseNotification } from "./apprise.service"

export interface DeliveryNotificationData {
  deliveryId: string
  deliveryNumber?: string
  orderId?: string
  customerName?: string
  customerAddress?: string
  restaurantName?: string
  restaurantAddress?: string
  estimatedTime?: string
  amount?: string
  items?: string[]
}

export interface CourierNotificationData {
  courierId: string
  courierName: string
  courierPhone?: string
  vehicleType?: string
}

/**
 * Delivery Notification Service
 * 
 * Sends targeted notifications for delivery events.
 */
export class DeliveryNotificationService {
  private apprise: AppriseService

  constructor(apprise: AppriseService) {
    this.apprise = apprise
  }

  /**
   * Notify drivers about new available delivery
   */
  async notifyNewDeliveryAvailable(
    data: DeliveryNotificationData,
    driverUrls?: string[]
  ) {
    const notification: AppriseNotification = {
      title: "🚴 New Delivery Available!",
      body: this.formatNewDeliveryMessage(data),
      type: "info",
      tag: "drivers",
    }

    return this.apprise.notify(notification, driverUrls)
  }

  /**
   * Notify specific driver that delivery is assigned to them
   */
  async notifyDeliveryAssigned(
    data: DeliveryNotificationData,
    courier: CourierNotificationData,
    courierUrls?: string[]
  ) {
    const notification: AppriseNotification = {
      title: "✅ Delivery Assigned to You",
      body: this.formatAssignedMessage(data),
      type: "success",
      tag: `courier-${courier.courierId}`,
    }

    return this.apprise.notify(notification, courierUrls)
  }

  /**
   * Notify producer that order is ready for pickup
   */
  async notifyReadyForPickup(
    data: DeliveryNotificationData,
    producerUrls?: string[]
  ) {
    const notification: AppriseNotification = {
      title: "📦 Driver Arriving for Pickup",
      body: `Driver is on the way to pick up order #${data.deliveryNumber || data.deliveryId.slice(-8)}`,
      type: "info",
      tag: "producers",
    }

    return this.apprise.notify(notification, producerUrls)
  }

  /**
   * Notify customer that order has been picked up
   */
  async notifyOrderPickedUp(
    data: DeliveryNotificationData,
    courier: CourierNotificationData,
    customerUrls?: string[]
  ) {
    const notification: AppriseNotification = {
      title: "🚴 Your Order is On the Way!",
      body: `${courier.courierName} has picked up your order and is heading your way. ${
        data.estimatedTime ? `ETA: ${data.estimatedTime}` : ""
      }`,
      type: "success",
      tag: "customers",
    }

    return this.apprise.notify(notification, customerUrls)
  }

  /**
   * Notify customer that driver has arrived
   */
  async notifyDriverArrived(
    data: DeliveryNotificationData,
    customerUrls?: string[]
  ) {
    const notification: AppriseNotification = {
      title: "🏠 Driver Has Arrived!",
      body: `Your delivery for order #${data.deliveryNumber || data.deliveryId.slice(-8)} has arrived at your location.`,
      type: "success",
      tag: "customers",
    }

    return this.apprise.notify(notification, customerUrls)
  }

  /**
   * Notify customer of successful delivery
   */
  async notifyDeliveryComplete(
    data: DeliveryNotificationData,
    customerUrls?: string[]
  ) {
    const notification: AppriseNotification = {
      title: "✅ Order Delivered!",
      body: `Your order #${data.deliveryNumber || data.deliveryId.slice(-8)} has been delivered. Enjoy your meal! 🍽️`,
      type: "success",
      tag: "customers",
    }

    return this.apprise.notify(notification, customerUrls)
  }

  /**
   * Notify about delivery issue
   */
  async notifyDeliveryIssue(
    data: DeliveryNotificationData,
    issue: string,
    targetUrls?: string[]
  ) {
    const notification: AppriseNotification = {
      title: "⚠️ Delivery Issue",
      body: `Order #${data.deliveryNumber || data.deliveryId.slice(-8)}: ${issue}`,
      type: "warning",
      tag: "support",
    }

    return this.apprise.notify(notification, targetUrls)
  }

  /**
   * Notify drivers of high-priority/express delivery
   */
  async notifyExpressDelivery(
    data: DeliveryNotificationData,
    driverUrls?: string[]
  ) {
    const notification: AppriseNotification = {
      title: "🔥 EXPRESS Delivery Available!",
      body: `HIGH PRIORITY: ${this.formatNewDeliveryMessage(data)}\n\n⚡ Express delivery - Higher payout!`,
      type: "warning",
      tag: "drivers",
    }

    return this.apprise.notify(notification, driverUrls)
  }

  // Helper methods for formatting messages

  private formatNewDeliveryMessage(data: DeliveryNotificationData): string {
    const lines = [
      `📍 Pickup: ${data.restaurantName || "Producer"}`,
    ]

    if (data.restaurantAddress) {
      lines.push(`   ${data.restaurantAddress}`)
    }

    lines.push(`📍 Deliver to: ${data.customerAddress || "See app for details"}`)

    if (data.amount) {
      lines.push(`💰 Payout: ${data.amount}`)
    }

    if (data.estimatedTime) {
      lines.push(`⏱️ Est. time: ${data.estimatedTime}`)
    }

    lines.push(`\nOrder #${data.deliveryNumber || data.deliveryId.slice(-8)}`)

    return lines.join("\n")
  }

  private formatAssignedMessage(data: DeliveryNotificationData): string {
    const lines = [
      `You've been assigned order #${data.deliveryNumber || data.deliveryId.slice(-8)}`,
      "",
      `📍 Pickup: ${data.restaurantName || "Producer"}`,
    ]

    if (data.restaurantAddress) {
      lines.push(`   ${data.restaurantAddress}`)
    }

    lines.push("", `📍 Deliver to: ${data.customerName || "Customer"}`)

    if (data.customerAddress) {
      lines.push(`   ${data.customerAddress}`)
    }

    if (data.items?.length) {
      lines.push("", "📦 Items:", ...data.items.map(item => `   • ${item}`))
    }

    return lines.join("\n")
  }
}

export function createDeliveryNotificationService(apprise: AppriseService): DeliveryNotificationService {
  return new DeliveryNotificationService(apprise)
}

export default DeliveryNotificationService
