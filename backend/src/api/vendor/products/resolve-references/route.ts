import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const USER_AGENT =
  "Mozilla/5.0 (compatible; FreeBlackMarketImportBot/1.0; +https://freeblackmarket.com)"

const sanitizeHandlePart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")

const stripTags = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()

const stripTrackingParams = (url: URL) => {
  const allowed = new URL(url.toString())
  const keep = new Set(["id", "variant", "product_id", "sku"])

  ;[...allowed.searchParams.keys()].forEach((key) => {
    if (!keep.has(key.toLowerCase())) {
      allowed.searchParams.delete(key)
    }
  })

  return allowed.toString()
}

const firstMatch = (html: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      return decodeEntities(match[1]).trim()
    }
  }

  return ""
}

const getMetaContent = (html: string, property: string) => {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  return firstMatch(html, [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i"),
  ])
}

const getJsonLdCandidates = (html: string) => {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]

  return matches
    .map((match) => match[1]?.trim())
    .filter((content): content is string => !!content)
}

const findProductObject = (value: unknown): Record<string, unknown> | null => {
  if (!value) {
    return null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findProductObject(item)
      if (found) {
        return found
      }
    }
    return null
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    const typeValue = obj["@type"]

    if (
      typeValue === "Product" ||
      (Array.isArray(typeValue) && typeValue.includes("Product"))
    ) {
      return obj
    }

    for (const child of Object.values(obj)) {
      const found = findProductObject(child)
      if (found) {
        return found
      }
    }
  }

  return null
}

const buildHandle = (resolvedUrl: URL, title: string) => {
  const hostName = sanitizeHandlePart(resolvedUrl.hostname.replace(/^www\./, "")) || "online-store"
  const pathLastSegment = resolvedUrl.pathname.split("/").filter(Boolean).pop() || "product"
  const slugSource = sanitizeHandlePart(pathLastSegment) || sanitizeHandlePart(title) || "product"

  return `${hostName}-${slugSource}`.slice(0, 120)
}

const extractDescription = (html: string) => {
  const fromMeta = getMetaContent(html, "description") || getMetaContent(html, "og:description")
  if (fromMeta) {
    return fromMeta
  }

  const article = firstMatch(html, [/<article[^>]*>([\s\S]{0,1500})<\/article>/i])
  if (article) {
    return stripTags(article).slice(0, 400)
  }

  return ""
}

const resolveReference = async (reference: string) => {
  const parsed = new URL(reference)
  const response = await fetch(reference, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  })

  if (!response.ok) {
    throw new Error(`Source returned ${response.status}`)
  }

  const html = await response.text()

  const canonical =
    getMetaContent(html, "og:url") ||
    firstMatch(html, [/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i]) ||
    response.url ||
    reference

  const canonicalUrl = new URL(canonical, parsed)
  const cleanUrl = stripTrackingParams(canonicalUrl)

  let title = getMetaContent(html, "og:title") || ""
  let image = getMetaContent(html, "og:image") || ""
  let priceAmount = ""

  const jsonLdBlocks = getJsonLdCandidates(html)

  for (const block of jsonLdBlocks) {
    try {
      const parsedJson = JSON.parse(block)
      const productObject = findProductObject(parsedJson)

      if (!productObject) {
        continue
      }

      if (!title && typeof productObject.name === "string") {
        title = productObject.name
      }

      if (!image) {
        const productImage = productObject.image
        if (typeof productImage === "string") {
          image = productImage
        } else if (Array.isArray(productImage)) {
          const firstImage = productImage.find((item) => typeof item === "string")
          if (typeof firstImage === "string") {
            image = firstImage
          }
        }
      }

      if (!priceAmount) {
        const offers = productObject.offers as Record<string, unknown> | Record<string, unknown>[] | undefined
        const offer = Array.isArray(offers) ? offers[0] : offers

        if (offer && typeof offer.price === "string") {
          priceAmount = offer.price
        } else if (offer && typeof offer.price === "number") {
          priceAmount = String(offer.price)
        }
      }

      if (title && image && priceAmount) {
        break
      }
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }

  if (!title) {
    title = firstMatch(html, [/<title[^>]*>([^<]+)<\/title>/i])
  }

  const description = extractDescription(html)
  const handle = buildHandle(canonicalUrl, title)

  return {
    reference,
    resolved_reference: cleanUrl,
    title: title || `Product from ${cleanUrl}`,
    handle,
    description,
    image,
    price_amount: priceAmount,
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as { references?: unknown }
  const references = Array.isArray(body.references)
    ? body.references.filter((item): item is string => typeof item === "string")
    : []

  if (!references.length) {
    return res.status(400).json({
      message: "At least one source reference is required.",
    })
  }

  const limitedReferences = references.slice(0, 25)

  const results = await Promise.all(
    limitedReferences.map(async (reference) => {
      try {
        const trimmed = reference.trim()
        if (!trimmed) {
          throw new Error("Reference is empty")
        }

        const normalizedUrl = new URL(trimmed)
        const resolved = await resolveReference(normalizedUrl.toString())

        return {
          ok: true,
          ...resolved,
        }
      } catch (error) {
        return {
          ok: false,
          reference,
          message: error instanceof Error ? error.message : "Failed to resolve reference",
        }
      }
    })
  )

  return res.status(200).json({
    products: results,
  })
}
