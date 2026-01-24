"use server"
import { Wishlist } from "@/types/wishlist"
import { medusaFetch } from "../config"
import { getAuthHeaders } from "./cookies"
import { revalidatePath } from "next/cache"

export const getUserWishlists = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return medusaFetch<{ wishlists: Wishlist[]; count: number }>(`/store/wishlist`, {
    cache: "no-cache",
    headers,
    method: "GET",
  })
    .then((res) => {
      return res
    })
}

export const addWishlistItem = async ({
  reference_id,
  reference,
}: {
  reference_id: string
  reference: "product"
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await medusaFetch(`/store/wishlist`, {
    headers,
    method: "POST",
    body: {
      reference,
      reference_id,
    },
  }).then(() => {
    revalidatePath("/wishlist")
  })
}

export const removeWishlistItem = async ({
  wishlist_id,
  product_id,
}: {
  wishlist_id: string
  product_id: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await medusaFetch(`/store/wishlist/${wishlist_id}/product/${product_id}`, {
    headers,
    method: "DELETE",
  }).then(() => {
    revalidatePath("/wishlist")
  })
}
