export type PrintfulClientConfig = {
  apiKey: string
  baseUrl?: string
  storeId?: string
}

type PrintfulApiResponse<T> = {
  result: T
}

type PrintfulAddress = {
  name?: string
  address1: string
  city: string
  state_code?: string
  country_code: string
  zip: string
  phone?: string
}

export type PrintfulOrderItemInput = {
  variant_id: number
  quantity: number
  files?: Array<{ url: string; type?: string }>
  retail_price?: string
  name?: string
}

export type PrintfulOrderPayload = {
  external_id: string
  recipient: PrintfulAddress
  items: PrintfulOrderItemInput[]
  shipping: "STANDARD" | "EXPRESS" | "OVERNIGHT"
}

export class PrintfulClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly storeId?: string

  constructor(config: PrintfulClientConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = (config.baseUrl || "https://api.printful.com").replace(/\/$/, "")
    this.storeId = config.storeId
  }

  async getCatalogProducts(limit = 100, offset = 0) {
    return this.request<unknown[]>(`/catalog/products?limit=${limit}&offset=${offset}`, {
      method: "GET",
    })
  }


  async getCatalogProduct(productId: string | number) {
    return this.request<unknown>(`/catalog/products/${productId}`, {
      method: "GET",
    })
  }

  async estimateShippingRates(payload: {
    recipient: PrintfulAddress
    items: Array<{ variant_id: number; quantity: number }>
    currency?: string
  }) {
    return this.request<unknown[]>("/shipping/rates", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async createOrder(payload: PrintfulOrderPayload) {
    return this.request<unknown>(this.buildStorePath("/orders"), {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async cancelOrder(orderId: string | number) {
    return this.request<unknown>(this.buildStorePath(`/orders/${orderId}`), {
      method: "DELETE",
    })
  }

  async uploadFile(payload: { url: string; visible?: boolean; type?: string }) {
    return this.request<unknown>("/files", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async validateAddress(payload: PrintfulAddress) {
    return this.request<unknown>("/address/validate", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  private buildStorePath(path: string): string {
    if (!this.storeId) {
      return path
    }

    return `/store/${this.storeId}${path}`
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    })

    const body = await response.json().catch(() => ({})) as {
      code?: number
      error?: { message?: string }
      result?: T
    }

    if (!response.ok) {
      throw new Error(body.error?.message || `Printful API error (${response.status})`)
    }

    return (body as PrintfulApiResponse<T>).result
  }
}

export default PrintfulClient
