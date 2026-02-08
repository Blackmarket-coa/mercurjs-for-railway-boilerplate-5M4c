"use server"

import { medusaFetch } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"

export type DemandPool = {
  id: string
  title: string
  description: string
  category?: string | null
  target_quantity: number
  min_quantity: number
  committed_quantity: number
  unit_of_measure?: string
  currency_code?: string
  status: string
  deadline?: string | null
  attractiveness_score?: number
}

export type DemandPoolDetails = DemandPool & {
  participants?: {
    total: number
    committed_quantity: number
    target_quantity: number
    progress_percent: number
    list: Array<Record<string, unknown>>
  }
  proposals?: {
    total: number
    list: Array<Record<string, unknown>>
  }
  bounties?: {
    total: number
    total_amount: number
    list: Array<Record<string, unknown>>
  }
}

export async function listDemandPools(query?: {
  category?: string
  delivery_region?: string
  sort_by?: "attractiveness" | "deadline" | "quantity" | "bounty"
  limit?: number
  offset?: number
}) {
  const response = await medusaFetch<{ demand_pools: DemandPool[] }>(
    "/store/collective/demand-pools",
    {
      method: "GET",
      query,
      cache: "no-store",
    }
  )

  return response.demand_pools || []
}

export async function getDemandPool(id: string) {
  const response = await medusaFetch<{ demand_pool: DemandPoolDetails }>(
    `/store/collective/demand-pools/${id}`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  return response.demand_pool
}

export async function createDemandPool(input: {
  title: string
  description: string
  category?: string
  target_quantity: number
  min_quantity: number
  unit_of_measure?: string
  target_price?: number
  currency_code?: string
}) {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    throw new Error("You must be logged in to create a demand pool")
  }

  return medusaFetch<{ demand_post: DemandPool }>("/store/collective/demand-pools", {
    method: "POST",
    headers: authHeaders,
    body: input,
    cache: "no-store",
  })
}

export async function publishDemandPool(id: string) {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    throw new Error("You must be logged in to publish a demand pool")
  }

  return medusaFetch<{ demand_post: DemandPool }>(
    `/store/collective/demand-pools/${id}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: { action: "publish" },
      cache: "no-store",
    }
  )
}

export async function joinDemandPool(
  id: string,
  input: { quantity_committed: number; price_willing_to_pay?: number }
) {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    throw new Error("You must be logged in to join a demand pool")
  }

  return medusaFetch<{ participant: Record<string, unknown> }>(
    `/store/collective/demand-pools/${id}/join`,
    {
      method: "POST",
      headers: authHeaders,
      body: input,
      cache: "no-store",
    }
  )
}
