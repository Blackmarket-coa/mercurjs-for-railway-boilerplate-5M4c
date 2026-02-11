import { backendUrl } from "../lib/client"

export default function imagesConverter(images: string) {
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(images)

  if (isLocalhost) {
    return images
      .replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, backendUrl)
      .replace(/^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, backendUrl)
  }

  return images
}
