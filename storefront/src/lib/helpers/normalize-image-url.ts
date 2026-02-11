const LOCAL_IMAGE_HOST_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export const normalizeImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) {
    return ""
  }

  const backendUrl =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""

  if (!backendUrl || !LOCAL_IMAGE_HOST_REGEX.test(imageUrl)) {
    return imageUrl
  }

  return imageUrl.replace(LOCAL_IMAGE_HOST_REGEX, stripTrailingSlash(backendUrl))
}

