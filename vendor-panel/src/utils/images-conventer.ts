import { backendUrl } from "../lib/client"

export default function imagesConverter(images: string) {
  if (typeof window === "undefined") {
    return images
  }

  let imageUrl: URL
  try {
    imageUrl = new URL(images)
  } catch {
    return images
  }

  let backendOrigin: string
  try {
    backendOrigin = new URL(backendUrl, window.location.origin).origin
  } catch {
    return images
  }

  if (!backendOrigin || imageUrl.origin === backendOrigin) {
    return images
  }

  if (!imageUrl.pathname.startsWith("/uploads")) {
    return images
  }

  const updatedUrl = new URL(imageUrl.pathname + imageUrl.search + imageUrl.hash, backendOrigin)
  return updatedUrl.toString()
}
