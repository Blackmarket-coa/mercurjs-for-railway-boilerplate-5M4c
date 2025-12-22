import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { validateVenueAvailabilityStep } from "./steps/validate-venue-availability"
import { createTicketProductsStep } from "./steps/create-ticket-products"
import {
  createProductsWorkflow,
  createInventoryItemsWorkflow,
  createRemoteLinkStep,
} from "@medusajs/medusa/core-flows"
import { CreateProductWorkflowInputDTO, CreateMoneyAmountDTO } from "@medusajs/framework/types"
import { TICKET_BOOKING_MODULE } from "../modules/ticket-booking"
import { RowType } from "../modules/ticket-booking/models/venue-row"
import { createTicketProductVariantsStep } from "./steps/create-ticket-product-variants"

export type CreateTicketProductWorkflowInput = {
  name: string
  venue_id: string
  dates: string[]
  variants: Array<{
    row_type: RowType
    seat_count: number
    prices: CreateMoneyAmountDTO[]
  }>
}

// Backend workflow
export const createTicketProductWorkflow = createWorkflow(
  "create-ticket-product",
  async (input: CreateTicketProductWorkflowInput, { container }) => {
    // 1️⃣ Validate availability
    await validateVenueAvailabilityStep.runAsStep({ input })

    // 2️⃣ Prepare inventory items
    const stores = await container.queryGraph({
      entity: "store",
      fields: ["id", "default_location_id", "default_sales_channel_id"],
    })

    const inventoryItemsData = transform(
      { input, stores },
      (data) => {
        const inventoryItems: any[] = []

        for (const date of data.input.dates) {
          for (const variant of data.input.variants) {
            inventoryItems.push({
              sku: `${data.input.name}-${date}-${variant.row_type}`,
              title: `${data.input.name} - ${date} - ${variant.row_type}`,
              description: `Ticket for ${data.input.name} on ${date} in ${variant.row_type} seating`,
              location_levels: [
                {
                  location_id: data.stores[0].default_location_id,
                  stocked_quantity: variant.seat_count,
                },
              ],
              requires_shipping: false,
            })
          }
        }

        return inventoryItems
      }
    )

    const inventoryItems = await createInventoryItemsWorkflow.runAsStep({
      input: { items: inventoryItemsData },
    })

    // 3️⃣ Create Medusa products
    const productData = transform(
      { input, inventoryItems, stores },
      (data) => {
        const rowTypes = [...new Set(data.input.variants.map((v) => v.row_type))]

        const product: CreateProductWorkflowInputDTO = {
          title: data.input.name,
          status: "published",
          options: [
            { title: "Date", values: data.input.dates },
            { title: "Row Type", values: rowTypes },
          ],
          variants: [] as any[],
        }

        if (data.stores[0].default_sales_channel_id) {
          product.sales_channels = [{ id: data.stores[0].default_sales_channel_id }]
        }

        let inventoryIndex = 0
        for (const date of data.input.dates) {
          for (const variant of data.input.variants) {
            product.variants!.push({
              title: `${data.input.name} - ${date} - ${variant.row_type}`,
              options: {
                Date: date,
                "Row Type": variant.row_type,
              },
              manage_inventory: true,
              inventory_items: [{ inventory_item_id: data.inventoryItems[inventoryIndex].id }],
              prices: variant.prices,
            })
            inventoryIndex++
          }
        }

        return [product]
      }
    )

    const medusaProduct = await createProductsWorkflow.runAsStep({
      input: { products: productData },
    })

    // 4️⃣ Create ticket products
    const ticketProductData = transform(
      { medusaProduct, input },
      (data) => ({
        ticket_products: data.medusaProduct.map((p: any) => ({
          product_id: p.id,
          venue_id: data.input.venue_id,
          dates: data.input.dates,
        })),
      })
    )

    const { ticket_products } = await createTicketProductsStep.runAsStep(ticketProductData)

    // 5️⃣ Create ticket product variants
    const ticketVariantsData = transform(
      { medusaProduct, ticket_products, input },
      (data) => ({
        variants: data.medusaProduct[0].variants.map((variant: any) => {
          const rowType = variant.options.find
