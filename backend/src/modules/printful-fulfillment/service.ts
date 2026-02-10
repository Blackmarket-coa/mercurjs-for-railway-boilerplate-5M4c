import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import {
  CreateFulfillmentResult,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
} from "@medusajs/framework/types"
import PrintfulClient, { PrintfulOrderItemInput } from "./client"

type PrintfulFulfillmentOptions = {
  api_key?: string
  base_url?: string
  store_id?: string
}

class PrintfulFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "printful"

  protected readonly client?: PrintfulClient

  constructor(_: unknown, options: PrintfulFulfillmentOptions = {}) {
    super()

    if (options.api_key) {
      this.client = new PrintfulClient({
        apiKey: options.api_key,
        baseUrl: options.base_url,
        storeId: options.store_id || process.env.PRINTFUL_STORE_ID,
      })
    }
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      {
        id: "printful-standard",
        name: "Printful Standard Shipping",
        is_return: false,
      },
      {
        id: "printful-express",
        name: "Printful Express Shipping",
        is_return: false,
      },
      {
        id: "printful-overnight",
        name: "Printful Overnight Shipping",
        is_return: false,
      },
      {
        id: "printful-return",
        name: "Printful Return",
        is_return: true,
      },
    ]
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.assertClient()

    const shippingAddress =
      (data.shipping_address as Record<string, unknown> | undefined) ||
      (context.shipping_address as Record<string, unknown> | undefined)

    if (!shippingAddress) {
      throw new Error("Printful fulfillment requires shipping_address")
    }

    await this.client!.validateAddress({
      name: (shippingAddress.first_name as string | undefined) || undefined,
      address1: String(shippingAddress.address_1 || ""),
      city: String(shippingAddress.city || ""),
      state_code: (shippingAddress.province as string | undefined) || undefined,
      country_code: String(shippingAddress.country_code || ""),
      zip: String(shippingAddress.postal_code || ""),
      phone: (shippingAddress.phone as string | undefined) || undefined,
    })

    return {
      ...data,
      ...optionData,
      validated_at: new Date().toISOString(),
    }
  }

  async validateOption(_: Record<string, any>): Promise<boolean> {
    return true
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    this.assertClient()

    const shippingAddress =
      (order?.shipping_address as Record<string, unknown> | undefined) ||
      (data.shipping_address as Record<string, unknown> | undefined)

    if (!shippingAddress) {
      throw new Error("Printful fulfillment requires shipping_address")
    }

    const printfulItems = items
      .map((item): PrintfulOrderItemInput | null => {
        const metadata = (item as any).metadata || {}
        const variantId = Number(metadata.printful_variant_id)

        if (!variantId) {
          return null
        }

        const files = Array.isArray(metadata.printful_files)
          ? metadata.printful_files.filter((file: unknown) => typeof (file as any)?.url === "string")
          : undefined

        return {
          variant_id: variantId,
          quantity: item.quantity || 1,
          files,
          name: item.title,
        }
      })
      .filter((item): item is PrintfulOrderItemInput => Boolean(item))

    if (!printfulItems.length) {
      throw new Error("No Printful-mapped items found. Add metadata.printful_variant_id to variants.")
    }

    const selectedMethod = String(data.shipping_method || "standard").toLowerCase()
    const shipping =
      selectedMethod.includes("overnight")
        ? "OVERNIGHT"
        : selectedMethod.includes("express")
          ? "EXPRESS"
          : "STANDARD"

    const orderResult = await this.client!.createOrder({
      external_id: String(fulfillment.id || order?.id || `printful-${Date.now()}`),
      shipping,
      recipient: {
        name: `${shippingAddress.first_name || ""} ${shippingAddress.last_name || ""}`.trim() || undefined,
        address1: String(shippingAddress.address_1 || ""),
        city: String(shippingAddress.city || ""),
        state_code: (shippingAddress.province as string | undefined) || undefined,
        country_code: String(shippingAddress.country_code || ""),
        zip: String(shippingAddress.postal_code || ""),
        phone: (shippingAddress.phone as string | undefined) || undefined,
      },
      items: printfulItems,
    })

    return {
      data: {
        ...data,
        printful_order: orderResult,
        submitted_at: new Date().toISOString(),
      },
      labels: [],
    }
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.assertClient()

    const orderId =
      (fulfillment.printful_order_id as string | undefined) ||
      ((fulfillment.printful_order as { id?: string | number } | undefined)?.id
        ? String((fulfillment.printful_order as { id: string | number }).id)
        : undefined)

    if (!orderId) {
      return {
        cancelled: true,
        cancelled_at: new Date().toISOString(),
        warning: "No printful_order_id found on fulfillment payload",
      }
    }

    const cancellation = await this.client!.cancelOrder(orderId)

    return {
      cancelled: true,
      cancelled_at: new Date().toISOString(),
      printful_cancellation: cancellation,
    }
  }

  async createReturnFulfillment(fulfillment: Record<string, unknown>): Promise<CreateFulfillmentResult> {
    return {
      data: {
        ...fulfillment,
        return_provider: "printful",
        created_at: new Date().toISOString(),
        status: "requested",
      },
      labels: [],
    }
  }

  private assertClient() {
    if (!this.client) {
      throw new Error("Printful provider is not configured. Set PRINTFUL_API_KEY.")
    }
  }
}

export default PrintfulFulfillmentService
