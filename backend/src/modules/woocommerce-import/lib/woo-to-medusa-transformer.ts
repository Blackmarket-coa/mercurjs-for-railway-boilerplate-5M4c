import type { WooProduct, WooVariation } from "../types"

/**
 * Strips HTML tags from a string, keeping basic text content.
 * Uses a simple regex approach to avoid needing a DOM parser on the server.
 */
function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ""

  return html
    // Remove script/style tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Replace common block elements with newlines
    .replace(/<\/?(p|div|br|h[1-6]|li|tr)\b[^>]*>/gi, "\n")
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function generateHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function parsePrice(priceStr: string | null | undefined): number {
  if (!priceStr) return 0
  const parsed = parseFloat(priceStr)
  if (isNaN(parsed)) return 0
  return Math.round(parsed * 100) // Convert to cents
}

function parseWeight(weightStr: string | null | undefined): number | null {
  if (!weightStr) return null
  const parsed = parseFloat(weightStr)
  if (isNaN(parsed)) return null
  // WooCommerce weight is in store's unit; assume kg, convert to grams
  return Math.round(parsed * 1000)
}

function parseDimension(dimStr: string | null | undefined): number | null {
  if (!dimStr) return null
  const parsed = parseFloat(dimStr)
  if (isNaN(parsed)) return null
  return parsed
}

function mapStatus(wooStatus: string): string {
  const statusMap: Record<string, string> = {
    publish: "published",
    draft: "draft",
    pending: "draft",
    private: "draft",
  }
  return statusMap[wooStatus] || "draft"
}

export interface TransformedProduct {
  title: string
  subtitle: string | null
  description: string
  handle: string
  status: string
  is_giftcard: boolean
  discountable: boolean
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  images: Array<{ url: string }>
  tags: Array<{ value: string }>
  options: Array<{
    title: string
    values: string[]
  }>
  variants: TransformedVariant[]
  metadata: Record<string, any>
}

export interface TransformedVariant {
  title: string
  sku: string
  manage_inventory: boolean
  inventory_quantity: number
  allow_backorder: boolean
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  prices: Array<{
    amount: number
    currency_code: string
  }>
  options: Record<string, string>
  metadata: Record<string, any>
}

export class WooToMedusaTransformer {
  private currency: string

  constructor(currency = "usd") {
    this.currency = currency.toLowerCase()
  }

  /**
   * Transform a WooCommerce product into a Medusa-compatible product input.
   */
  transformProduct(
    wooProduct: WooProduct,
    wooVariations?: WooVariation[],
    importAsDraft = true
  ): TransformedProduct {
    const status = importAsDraft ? "draft" : mapStatus(wooProduct.status)

    return {
      title: wooProduct.name,
      subtitle: wooProduct.short_description
        ? sanitizeHtml(wooProduct.short_description).substring(0, 255)
        : null,
      description: sanitizeHtml(wooProduct.description),
      handle: wooProduct.slug || generateHandle(wooProduct.name),
      status,
      is_giftcard: false,
      discountable: true,
      weight: parseWeight(wooProduct.weight),
      length: parseDimension(wooProduct.dimensions?.length),
      width: parseDimension(wooProduct.dimensions?.width),
      height: parseDimension(wooProduct.dimensions?.height),
      images: this.transformImages(wooProduct.images),
      tags: (wooProduct.tags || []).map((tag) => ({ value: tag.name })),
      options: this.transformOptions(wooProduct),
      variants: this.transformVariants(wooProduct, wooVariations),
      metadata: {
        woo_product_id: String(wooProduct.id),
        woo_permalink: wooProduct.permalink || null,
        woo_last_synced: new Date().toISOString(),
        woo_date_modified: wooProduct.date_modified || null,
        offering_type: "general",
        original_categories: JSON.stringify(wooProduct.categories || []),
      },
    }
  }

  private transformImages(
    wooImages: WooProduct["images"]
  ): Array<{ url: string }> {
    if (!wooImages || wooImages.length === 0) return []
    return wooImages.map((img) => ({ url: img.src }))
  }

  private transformOptions(
    wooProduct: WooProduct
  ): Array<{ title: string; values: string[] }> {
    if (wooProduct.type !== "variable") return []

    return (wooProduct.attributes || [])
      .filter((attr) => attr.variation)
      .map((attr) => ({
        title: attr.name,
        values: attr.options || [],
      }))
  }

  private transformVariants(
    wooProduct: WooProduct,
    wooVariations?: WooVariation[]
  ): TransformedVariant[] {
    // Simple product -> single variant
    if (wooProduct.type === "simple") {
      return [
        {
          title: "Default",
          sku: wooProduct.sku || `woo-${wooProduct.id}`,
          manage_inventory: wooProduct.manage_stock,
          inventory_quantity: wooProduct.stock_quantity ?? 0,
          allow_backorder: wooProduct.backorders_allowed,
          weight: parseWeight(wooProduct.weight),
          length: parseDimension(wooProduct.dimensions?.length),
          width: parseDimension(wooProduct.dimensions?.width),
          height: parseDimension(wooProduct.dimensions?.height),
          prices: [
            {
              amount: parsePrice(wooProduct.price || wooProduct.regular_price),
              currency_code: this.currency,
            },
          ],
          options: {},
          metadata: {
            woo_variant_id: String(wooProduct.id),
            woo_regular_price: wooProduct.regular_price || null,
            woo_sale_price: wooProduct.sale_price || null,
          },
        },
      ]
    }

    // Variable product -> multiple variants from variations
    if (wooProduct.type === "variable" && wooVariations && wooVariations.length > 0) {
      return wooVariations.map((variation) => {
        const optionMap: Record<string, string> = {}
        for (const attr of variation.attributes) {
          optionMap[attr.name] = attr.option
        }

        return {
          title: this.generateVariantTitle(variation.attributes),
          sku: variation.sku || `woo-${wooProduct.id}-${variation.id}`,
          manage_inventory: variation.manage_stock ?? wooProduct.manage_stock,
          inventory_quantity: variation.stock_quantity ?? 0,
          allow_backorder: variation.backorders_allowed ?? wooProduct.backorders_allowed,
          weight: parseWeight(variation.weight || wooProduct.weight),
          length: parseDimension(variation.dimensions?.length || wooProduct.dimensions?.length),
          width: parseDimension(variation.dimensions?.width || wooProduct.dimensions?.width),
          height: parseDimension(variation.dimensions?.height || wooProduct.dimensions?.height),
          prices: [
            {
              amount: parsePrice(variation.price || variation.regular_price),
              currency_code: this.currency,
            },
          ],
          options: optionMap,
          metadata: {
            woo_variant_id: String(variation.id),
            woo_regular_price: variation.regular_price || null,
            woo_sale_price: variation.sale_price || null,
          },
        }
      })
    }

    // Variable product with no variations fetched yet - create a placeholder
    return [
      {
        title: "Default",
        sku: wooProduct.sku || `woo-${wooProduct.id}`,
        manage_inventory: wooProduct.manage_stock,
        inventory_quantity: wooProduct.stock_quantity ?? 0,
        allow_backorder: wooProduct.backorders_allowed,
        weight: parseWeight(wooProduct.weight),
        length: parseDimension(wooProduct.dimensions?.length),
        width: parseDimension(wooProduct.dimensions?.width),
        height: parseDimension(wooProduct.dimensions?.height),
        prices: [
          {
            amount: parsePrice(wooProduct.price || wooProduct.regular_price),
            currency_code: this.currency,
          },
        ],
        options: {},
        metadata: {
          woo_variant_id: String(wooProduct.id),
          woo_regular_price: wooProduct.regular_price || null,
          woo_sale_price: wooProduct.sale_price || null,
        },
      },
    ]
  }

  private generateVariantTitle(
    attributes: WooVariation["attributes"]
  ): string {
    if (!attributes || attributes.length === 0) return "Default"
    return attributes.map((attr) => attr.option).join(" / ")
  }
}
